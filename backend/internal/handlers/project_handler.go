package handlers

import (
	"fmt"
	"net/http"
	"time"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProjectHandler struct {
	db *gorm.DB
}

func NewProjectHandler(db *gorm.DB) *ProjectHandler {
	return &ProjectHandler{db: db}
}

func (h *ProjectHandler) enrichProject(p *models.Project) {
	// 1. Calculate verified payments
	var totalPaid float64
	h.db.Model(&models.Payment{}).
		Where("project_id = ? AND is_verified = ?", p.ID, true).
		Select("COALESCE(SUM(amount), 0)").Scan(&totalPaid)
	p.TotalPaid = totalPaid

	// 2. Remaining amount
	p.RemainingAmount = p.ContractValue - totalPaid
	if p.RemainingAmount < 0 {
		p.RemainingAmount = 0
	}

	// 3. Expenses
	var totalExpenses float64
	h.db.Model(&models.Expense{}).
		Where("project_id = ?", p.ID).
		Select("COALESCE(SUM(amount), 0)").Scan(&totalExpenses)
	p.TotalExpenses = totalExpenses

	// 4. Profit = Total Verified Income - Total Expenses
	p.Profit = totalPaid - totalExpenses

	// 5. Progress percent
	var totalTasks int64
	var completedTasks int64
	h.db.Model(&models.Task{}).Where("project_id = ?", p.ID).Count(&totalTasks)
	if totalTasks > 0 {
		h.db.Model(&models.Task{}).Where("project_id = ? AND status = ?", p.ID, models.TaskCompleted).Count(&completedTasks)
		p.ProgressPercent = int((float64(completedTasks) / float64(totalTasks)) * 100)
	} else {
		p.ProgressPercent = 0
	}
}

func (h *ProjectHandler) GetProjects(c *gin.Context) {
	status := c.Query("status")
	clientID := c.Query("client_id")
	search := c.Query("search")

	var projects []models.Project
	query := h.db.Preload("Client").Preload("Package").Preload("PIC").Order("event_date asc, created_at desc")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if clientID != "" {
		query = query.Where("client_id = ?", clientID)
	}
	if search != "" {
		s := "%" + search + "%"
		query = query.Joins("LEFT JOIN clients ON clients.id = projects.client_id").
			Where("projects.project_number LIKE ? OR clients.name LIKE ? OR projects.venue_name LIKE ?", s, s, s)
	}

	if err := query.Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := range projects {
		h.enrichProject(&projects[i])
	}

	c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) GetProjectByID(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	if err := h.db.
		Preload("Client").
		Preload("Package").
		Preload("PIC").
		Preload("Events").
		Preload("Tasks.Assignee").
		Preload("Members.User").
		Preload("Invoices.Items").
		Preload("Payments").
		Preload("Expenses").
		Preload("MeetingNotes.CreatedBy").
		Preload("MeetingNotes.Actions.Assignee").
		Preload("Documents").
		First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan"})
		return
	}

	h.enrichProject(&project)
	c.JSON(http.StatusOK, project)
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var req struct {
		ClientID        uint                 `json:"client_id" binding:"required"`
		PackageID       *uint                `json:"package_id"`
		ContractValue   float64              `json:"contract_value"`
		Status          models.ProjectStatus `json:"status"`
		EventDate       *time.Time           `json:"event_date"`
		EventStartTime  string               `json:"event_start_time"`
		EventEndTime    string               `json:"event_end_time"`
		VenueName       string               `json:"venue_name"`
		VenueAddress    string               `json:"venue_address"`
		PICID           *uint                `json:"pic_id"`
		Notes           string               `json:"notes"`
		SpecialRequests string               `json:"special_requests"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate auto project number: PRJ-YYYYMM-XXX
	now := time.Now()
	prefix := fmt.Sprintf("PRJ-%s", now.Format("200601"))
	var count int64
	h.db.Model(&models.Project{}).Where("project_number LIKE ?", prefix+"%").Count(&count)
	projectNumber := fmt.Sprintf("%s-%03d", prefix, count+1)

	if req.Status == "" {
		req.Status = models.StatusLead
	}

	// If package selected and contract value is 0, pull package price
	if req.ContractValue == 0 && req.PackageID != nil {
		var pkg models.Package
		if err := h.db.First(&pkg, *req.PackageID).Error; err == nil {
			req.ContractValue = pkg.Price
		}
	}

	project := models.Project{
		ProjectNumber:   projectNumber,
		ClientID:        req.ClientID,
		PackageID:       req.PackageID,
		ContractValue:   req.ContractValue,
		Status:          req.Status,
		EventDate:       req.EventDate,
		EventStartTime:  req.EventStartTime,
		EventEndTime:    req.EventEndTime,
		VenueName:       req.VenueName,
		VenueAddress:    req.VenueAddress,
		PICID:           req.PICID,
		Notes:           req.Notes,
		SpecialRequests: req.SpecialRequests,
	}

	if err := h.db.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Initialize the 10 Standard Production Stages as specified in README Section 4.5
	standardStages := []struct {
		Stage int
		Title string
		Desc  string
	}{
		{1, "Pengambilan foto/video", "Liputan lapangan hari H sesuai rundown dan kesepakatan"},
		{2, "Backup file", "Penyalinan seluruh memory card ke hard drive/SSD editing & cloud"},
		{3, "Seleksi foto", "Kurasi foto-foto terbaik dari seluruh master foto"},
		{4, "Editing foto", "Color grading khas Tumata, tone cinematic, & skin retouching"},
		{5, "Editing video", "Assembly footage, audio mixing, color correction cinematic highlight"},
		{6, "Review internal", "Quality control alur dan kualitas oleh studio lead"},
		{7, "Revisi klien", "Klien meninjau hasil draf dan memberikan masukan bila ada"},
		{8, "Finalisasi", "Export master 4K, layout & cetak album kolase serta frame kanvas"},
		{9, "Pengiriman hasil", "Pengiriman akses Cloud Gallery & packaging wooden USB box"},
		{10, "Konfirmasi penyerahan", "Konfirmasi penerimaan hasil oleh klien dan penutupan proyek"},
	}

	for _, s := range standardStages {
		var deadline *time.Time
		if req.EventDate != nil {
			dl := req.EventDate.AddDate(0, 0, s.Stage*2)
			deadline = &dl
		}
		h.db.Create(&models.Task{
			ProjectID:   project.ID,
			Stage:       s.Stage,
			Title:       s.Title,
			Description: s.Desc,
			AssigneeID:  req.PICID,
			Status:      models.TaskPending,
			Deadline:    deadline,
		})
	}

	h.enrichProject(&project)
	c.JSON(http.StatusCreated, project)
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	if err := h.db.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan"})
		return
	}

	var req struct {
		PackageID       *uint                `json:"package_id"`
		ContractValue   float64              `json:"contract_value"`
		Status          models.ProjectStatus `json:"status"`
		EventDate       *time.Time           `json:"event_date"`
		EventStartTime  string               `json:"event_start_time"`
		EventEndTime    string               `json:"event_end_time"`
		VenueName       string               `json:"venue_name"`
		VenueAddress    string               `json:"venue_address"`
		PICID           *uint                `json:"pic_id"`
		Notes           string               `json:"notes"`
		SpecialRequests string               `json:"special_requests"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project.PackageID = req.PackageID
	project.ContractValue = req.ContractValue
	project.Status = req.Status
	project.EventDate = req.EventDate
	project.EventStartTime = req.EventStartTime
	project.EventEndTime = req.EventEndTime
	project.VenueName = req.VenueName
	project.VenueAddress = req.VenueAddress
	project.PICID = req.PICID
	project.Notes = req.Notes
	project.SpecialRequests = req.SpecialRequests

	if err := h.db.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.enrichProject(&project)
	c.JSON(http.StatusOK, project)
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.Project{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Proyek berhasil dihapus"})
}
