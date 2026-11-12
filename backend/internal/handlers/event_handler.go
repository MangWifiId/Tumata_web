package handlers

import (
	"fmt"
	"net/http"
	"time"

	"tumata-backend/internal/models"
	"tumata-backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EventHandler struct {
	db              *gorm.DB
	conflictService *services.ConflictService
}

func NewEventHandler(db *gorm.DB, conflictService *services.ConflictService) *EventHandler {
	return &EventHandler{db: db, conflictService: conflictService}
}

func (h *EventHandler) GetEvents(c *gin.Context) {
	projectID := c.Query("project_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var events []models.Event
	query := h.db.Preload("Project.Client").Order("start_time asc")

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	if startDateStr != "" {
		if t, err := time.Parse(time.RFC3339, startDateStr); err == nil {
			query = query.Where("end_time >= ?", t)
		}
	}
	if endDateStr != "" {
		if t, err := time.Parse(time.RFC3339, endDateStr); err == nil {
			query = query.Where("start_time <= ?", t)
		}
	}

	if err := query.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}

func (h *EventHandler) CheckConflicts(c *gin.Context) {
	var req struct {
		ProjectID      uint      `json:"project_id" binding:"required"`
		StartTime      time.Time `json:"start_time" binding:"required"`
		EndTime        time.Time `json:"end_time" binding:"required"`
		ExcludeEventID uint      `json:"exclude_event_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	eventConflicts := h.conflictService.CheckEventConflicts(req.ProjectID, req.StartTime, req.EndTime, req.ExcludeEventID)
	teamConflicts := h.conflictService.CheckTeamMemberConflict(req.ProjectID, req.StartTime, req.EndTime)

	allConflicts := append(eventConflicts, teamConflicts...)

	c.JSON(http.StatusOK, gin.H{
		"has_conflict": len(allConflicts) > 0,
		"conflicts":    allConflicts,
	})
}

func (h *EventHandler) CreateEvent(c *gin.Context) {
	var event models.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check conflict
	eventConflicts := h.conflictService.CheckEventConflicts(event.ProjectID, event.StartTime, event.EndTime, 0)
	teamConflicts := h.conflictService.CheckTeamMemberConflict(event.ProjectID, event.StartTime, event.EndTime)
	allConflicts := append(eventConflicts, teamConflicts...)

	if len(allConflicts) > 0 {
		warningText := ""
		for _, cf := range allConflicts {
			warningText += fmt.Sprintf("• [%s] %s\n", cf.Type, cf.Message)
		}
		event.ConflictWarning = warningText
	}

	if err := h.db.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Preload("Project.Client").First(&event, event.ID)
	c.JSON(http.StatusCreated, gin.H{
		"event":         event,
		"has_conflict": len(allConflicts) > 0,
		"conflicts":    allConflicts,
	})
}

func (h *EventHandler) UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := h.db.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Acara tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Recheck conflict
	eventConflicts := h.conflictService.CheckEventConflicts(event.ProjectID, event.StartTime, event.EndTime, event.ID)
	teamConflicts := h.conflictService.CheckTeamMemberConflict(event.ProjectID, event.StartTime, event.EndTime)
	allConflicts := append(eventConflicts, teamConflicts...)

	if len(allConflicts) > 0 {
		warningText := ""
		for _, cf := range allConflicts {
			warningText += fmt.Sprintf("• [%s] %s\n", cf.Type, cf.Message)
		}
		event.ConflictWarning = warningText
	} else {
		event.ConflictWarning = ""
	}

	if err := h.db.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"event":         event,
		"has_conflict": len(allConflicts) > 0,
		"conflicts":    allConflicts,
	})
}

func (h *EventHandler) DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.Event{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Acara berhasil dihapus"})
}
