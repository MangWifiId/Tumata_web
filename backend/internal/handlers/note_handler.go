package handlers

import (
	"net/http"
	"time"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NoteHandler struct {
	db *gorm.DB
}

func NewNoteHandler(db *gorm.DB) *NoteHandler {
	return &NoteHandler{db: db}
}

func (h *NoteHandler) GetNotes(c *gin.Context) {
	projectID := c.Query("project_id")
	var notes []models.MeetingNote

	query := h.db.Preload("CreatedBy").Preload("Actions.Assignee").Order("meeting_date desc")
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}

	if err := query.Find(&notes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, notes)
}

func (h *NoteHandler) CreateNote(c *gin.Context) {
	var req struct {
		ProjectID       uint      `json:"project_id" binding:"required"`
		MeetingDate     time.Time `json:"meeting_date" binding:"required"`
		Participants    string    `json:"participants" binding:"required"`
		Topic           string    `json:"topic" binding:"required"`
		SpecialRequests string    `json:"special_requests"`
		Agreements      string    `json:"agreements"`
		Actions         []struct {
			ActionItem string     `json:"action_item"`
			AssigneeID *uint      `json:"assignee_id"`
			Deadline   *time.Time `json:"deadline"`
		} `json:"actions"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	note := models.MeetingNote{
		ProjectID:       req.ProjectID,
		MeetingDate:     req.MeetingDate,
		Participants:    req.Participants,
		Topic:           req.Topic,
		SpecialRequests: req.SpecialRequests,
		Agreements:      req.Agreements,
		CreatedByID:     userID,
	}

	if err := h.db.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, act := range req.Actions {
		if act.ActionItem != "" {
			h.db.Create(&models.NoteAction{
				MeetingNoteID: note.ID,
				ActionItem:    act.ActionItem,
				AssigneeID:    act.AssigneeID,
				Deadline:      act.Deadline,
				IsDone:        false,
			})
		}
	}

	h.db.Preload("CreatedBy").Preload("Actions.Assignee").First(&note, note.ID)
	c.JSON(http.StatusCreated, note)
}

func (h *NoteHandler) ToggleActionItem(c *gin.Context) {
	actionID := c.Param("action_id")
	var action models.NoteAction

	if err := h.db.First(&action, actionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tindak lanjut tidak ditemukan"})
		return
	}

	action.IsDone = !action.IsDone
	if err := h.db.Save(&action).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, action)
}

func (h *NoteHandler) DeleteNote(c *gin.Context) {
	id := c.Param("id")
	h.db.Where("meeting_note_id = ?", id).Delete(&models.NoteAction{})
	if err := h.db.Delete(&models.MeetingNote{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notulensi berhasil dihapus"})
}
