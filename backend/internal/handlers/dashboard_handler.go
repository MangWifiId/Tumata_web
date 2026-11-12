package handlers

import (
	"net/http"
	"time"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

type DashboardMetrics struct {
	ProjectsThisMonth     int64            `json:"projects_this_month"`
	OngoingProjectsCount  int64            `json:"ongoing_projects_count"`
	OverdueProjectsCount  int64            `json:"overdue_projects_count"`
	PendingPaymentsCount  int64            `json:"pending_payments_count"`
	UnfinishedTasksCount  int64            `json:"unfinished_tasks_count"`
	TotalContractValue    float64          `json:"total_contract_value"`
	TotalPaymentsReceived float64          `json:"total_payments_received"`
	TotalReceivable       float64          `json:"total_receivable"`
	TotalExpenses         float64          `json:"total_expenses"`
	NetProfit             float64          `json:"net_profit"`
	UpcomingEvents        []models.Event   `json:"upcoming_events"`
	UnpaidInvoices        []models.Invoice `json:"unpaid_invoices"`
	ActiveProjects        []models.Project `json:"active_projects"`
	PendingTasks          []models.Task    `json:"pending_tasks"`
}

func (h *DashboardHandler) GetMetrics(c *gin.Context) {
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Nanosecond)

	var metrics DashboardMetrics

	// Projects this month
	h.db.Model(&models.Project{}).
		Where("created_at >= ? AND created_at <= ?", startOfMonth, endOfMonth).
		Count(&metrics.ProjectsThisMonth)

	// Ongoing projects (Status not Lead, Selesai, or Diarsipkan)
	h.db.Model(&models.Project{}).
		Where("status NOT IN (?, ?, ?)", models.StatusLead, models.StatusSelesai, models.StatusDiarsipkan).
		Count(&metrics.OngoingProjectsCount)

	// Overdue projects (EventDate in past, but status not Selesai/Diarsipkan)
	h.db.Model(&models.Project{}).
		Where("event_date < ? AND status NOT IN (?, ?)", now, models.StatusSelesai, models.StatusDiarsipkan).
		Count(&metrics.OverdueProjectsCount)

	// Unfinished tasks count
	h.db.Model(&models.Task{}).
		Where("status != ?", models.TaskCompleted).
		Count(&metrics.UnfinishedTasksCount)

	// Financials
	h.db.Model(&models.Project{}).Select("COALESCE(SUM(contract_value), 0)").Scan(&metrics.TotalContractValue)
	h.db.Model(&models.Payment{}).Where("is_verified = ?", true).Select("COALESCE(SUM(amount), 0)").Scan(&metrics.TotalPaymentsReceived)
	h.db.Model(&models.Expense{}).Select("COALESCE(SUM(amount), 0)").Scan(&metrics.TotalExpenses)

	metrics.TotalReceivable = metrics.TotalContractValue - metrics.TotalPaymentsReceived
	if metrics.TotalReceivable < 0 {
		metrics.TotalReceivable = 0
	}
	metrics.NetProfit = metrics.TotalPaymentsReceived - metrics.TotalExpenses

	// Upcoming events (next 10 events starting from now or recent)
	h.db.Preload("Project.Client").
		Where("start_time >= ?", now.AddDate(0, 0, -1)).
		Order("start_time asc").
		Limit(8).
		Find(&metrics.UpcomingEvents)

	// Unpaid/Partial Invoices
	h.db.Preload("Project.Client").
		Where("status IN (?, ?)", models.InvoiceUnpaid, models.InvoicePartial).
		Order("due_date asc").
		Limit(6).
		Find(&metrics.UnpaidInvoices)
	metrics.PendingPaymentsCount = int64(len(metrics.UnpaidInvoices))

	// Active Projects (recent 6)
	h.db.Preload("Client").Preload("Package").Preload("PIC").
		Where("status NOT IN (?, ?)", models.StatusSelesai, models.StatusDiarsipkan).
		Order("event_date asc").
		Limit(6).
		Find(&metrics.ActiveProjects)

	// Pending Tasks (due soonest)
	h.db.Preload("Assignee").
		Where("status != ?", models.TaskCompleted).
		Order("deadline asc, stage asc").
		Limit(8).
		Find(&metrics.PendingTasks)

	c.JSON(http.StatusOK, metrics)
}
