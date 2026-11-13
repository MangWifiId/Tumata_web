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

func isPrivilegedRole(role models.UserRole) bool {
	return role == models.RoleAdmin || role == models.RoleOwner
}

// projectScope returns a subquery of project IDs the given user is involved in:
// as PIC, as an assigned project member, or as the assignee of a project task.
func (h *DashboardHandler) projectScope(userID uint) *gorm.DB {
	return h.db.Model(&models.Project{}).Select("projects.id").
		Where("projects.pic_id = ?", userID).
		Or("projects.id IN (?)", h.db.Model(&models.ProjectMember{}).
			Select("project_id").Where("user_id = ?", userID)).
		Or("projects.id IN (?)", h.db.Model(&models.Task{}).
			Select("project_id").Where("assignee_id = ?", userID))
}

// scopedProjects returns a project query limited to the user's projects for
// non-privileged roles, or all projects for admin/owner.
func (h *DashboardHandler) scopedProjects(userID uint, isPrivileged bool) *gorm.DB {
	query := h.db.Model(&models.Project{})
	if !isPrivileged {
		query = query.Where("projects.id IN (?)", h.projectScope(userID))
	}
	return query
}

// scopedTasks returns a task query limited to tasks assigned to the user for
// non-privileged roles, or all tasks for admin/owner.
func (h *DashboardHandler) scopedTasks(userID uint, isPrivileged bool) *gorm.DB {
	query := h.db.Model(&models.Task{})
	if !isPrivileged {
		query = query.Where("assignee_id = ?", userID)
	}
	return query
}

func (h *DashboardHandler) GetMetrics(c *gin.Context) {
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Nanosecond)

	userID := c.GetUint("user_id")
	roleValue, _ := c.Get("role")
	userRole, _ := roleValue.(models.UserRole)
	isPrivileged := isPrivilegedRole(userRole)

	var metrics DashboardMetrics

	// Projects this month
	h.scopedProjects(userID, isPrivileged).
		Where("projects.created_at >= ? AND projects.created_at <= ?", startOfMonth, endOfMonth).
		Count(&metrics.ProjectsThisMonth)

	// Ongoing projects (Status not Lead, Selesai, or Diarsipkan)
	h.scopedProjects(userID, isPrivileged).
		Where("projects.status NOT IN (?, ?, ?)", models.StatusLead, models.StatusSelesai, models.StatusDiarsipkan).
		Count(&metrics.OngoingProjectsCount)

	// Overdue projects (EventDate in past, but status not Selesai/Diarsipkan)
	h.scopedProjects(userID, isPrivileged).
		Where("projects.event_date < ? AND projects.status NOT IN (?, ?)", now, models.StatusSelesai, models.StatusDiarsipkan).
		Count(&metrics.OverdueProjectsCount)

	// Unfinished tasks count
	h.scopedTasks(userID, isPrivileged).
		Where("status != ?", models.TaskCompleted).
		Count(&metrics.UnfinishedTasksCount)

	// Financials (scoped to the user's projects for staff)
	contractQuery := h.scopedProjects(userID, isPrivileged)
	contractQuery.Select("COALESCE(SUM(contract_value), 0)").Scan(&metrics.TotalContractValue)

	paymentQuery := h.db.Model(&models.Payment{}).Where("is_verified = ?", true)
	expenseQuery := h.db.Model(&models.Expense{})
	if !isPrivileged {
		scope := h.projectScope(userID)
		paymentQuery = paymentQuery.Where("project_id IN (?)", scope)
		expenseQuery = expenseQuery.Where("project_id IN (?)", h.projectScope(userID))
	}
	paymentQuery.Select("COALESCE(SUM(amount), 0)").Scan(&metrics.TotalPaymentsReceived)
	expenseQuery.Select("COALESCE(SUM(amount), 0)").Scan(&metrics.TotalExpenses)

	metrics.TotalReceivable = metrics.TotalContractValue - metrics.TotalPaymentsReceived
	if metrics.TotalReceivable < 0 {
		metrics.TotalReceivable = 0
	}
	metrics.NetProfit = metrics.TotalPaymentsReceived - metrics.TotalExpenses

	// Upcoming events (next 8 events starting from now or recent)
	eventQuery := h.db.Preload("Project.Client").
		Where("start_time >= ?", now.AddDate(0, 0, -1))
	if !isPrivileged {
		eventQuery = eventQuery.Where("project_id IN (?)", h.projectScope(userID))
	}
	eventQuery.Order("start_time asc").Limit(8).Find(&metrics.UpcomingEvents)

	// Unpaid/Partial Invoices
	invoiceQuery := h.db.Preload("Project.Client").
		Where("status IN (?, ?)", models.InvoiceUnpaid, models.InvoicePartial)
	if !isPrivileged {
		invoiceQuery = invoiceQuery.Where("project_id IN (?)", h.projectScope(userID))
	}
	invoiceQuery.Order("due_date asc").Limit(6).Find(&metrics.UnpaidInvoices)
	metrics.PendingPaymentsCount = int64(len(metrics.UnpaidInvoices))

	// Active Projects (recent 6)
	h.scopedProjects(userID, isPrivileged).
		Preload("Client").Preload("Package").Preload("PIC").
		Where("projects.status NOT IN (?, ?)", models.StatusSelesai, models.StatusDiarsipkan).
		Order("projects.event_date asc").
		Limit(6).
		Find(&metrics.ActiveProjects)

	// Pending Tasks (due soonest)
	h.scopedTasks(userID, isPrivileged).
		Preload("Assignee").
		Where("status != ?", models.TaskCompleted).
		Order("deadline asc, stage asc").
		Limit(8).
		Find(&metrics.PendingTasks)

	c.JSON(http.StatusOK, metrics)
}
