package handlers

import (
	"net/http"
	"time"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TaskHandler struct {
	db *gorm.DB
}

func NewTaskHandler(db *gorm.DB) *TaskHandler {
	return &TaskHandler{db: db}
}

func (h *TaskHandler) GetTasks(c *gin.Context) {
	projectID := c.Query("project_id")
	status := c.Query("status")

	var tasks []models.Task
	query := h.db.Preload("Assignee").Order("stage asc, deadline asc")

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task

	if err := h.db.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	var req struct {
		Title       string            `json:"title"`
		Description string            `json:"description"`
		AssigneeID  *uint             `json:"assignee_id"`
		Status      models.TaskStatus `json:"status"`
		Deadline    *time.Time        `json:"deadline"`
		Notes       string            `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != "" {
		task.Title = req.Title
	}
	task.Description = req.Description
	task.AssigneeID = req.AssigneeID
	task.Deadline = req.Deadline
	task.Notes = req.Notes

	if req.Status != "" {
		task.Status = req.Status
		if req.Status == models.TaskCompleted && task.CompletedAt == nil {
			now := time.Now()
			task.CompletedAt = &now
		} else if req.Status != models.TaskCompleted {
			task.CompletedAt = nil
		}
	}

	if err := h.db.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Preload("Assignee").First(&task, task.ID)
	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")
	var task models.Task

	if err := h.db.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	var req struct {
		Status models.TaskStatus `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.Status = req.Status
	if req.Status == models.TaskCompleted {
		now := time.Now()
		task.CompletedAt = &now
	} else {
		task.CompletedAt = nil
	}

	if err := h.db.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Preload("Assignee").First(&task, task.ID)
	c.JSON(http.StatusOK, task)
}
