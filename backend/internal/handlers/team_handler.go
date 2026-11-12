package handlers

import (
	"net/http"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TeamHandler struct {
	db *gorm.DB
}

func NewTeamHandler(db *gorm.DB) *TeamHandler {
	return &TeamHandler{db: db}
}

type TeamMemberStats struct {
	User             models.User `json:"user"`
	AssignedProjects int64       `json:"assigned_projects"`
	PendingTasks     int64       `json:"pending_tasks"`
	CompletedTasks   int64       `json:"completed_tasks"`
}

func (h *TeamHandler) GetTeamMembers(c *gin.Context) {
	var users []models.User
	h.db.Order("name asc").Find(&users)

	var result []TeamMemberStats
	for _, u := range users {
		var projCount int64
		h.db.Model(&models.ProjectMember{}).Where("user_id = ?", u.ID).Count(&projCount)

		var pendingCount int64
		h.db.Model(&models.Task{}).Where("assignee_id = ? AND status != ?", u.ID, models.TaskCompleted).Count(&pendingCount)

		var completedCount int64
		h.db.Model(&models.Task{}).Where("assignee_id = ? AND status = ?", u.ID, models.TaskCompleted).Count(&completedCount)

		result = append(result, TeamMemberStats{
			User:             u,
			AssignedProjects: projCount,
			PendingTasks:     pendingCount,
			CompletedTasks:   completedCount,
		})
	}

	c.JSON(http.StatusOK, result)
}

func (h *TeamHandler) AssignMemberToProject(c *gin.Context) {
	var member models.ProjectMember
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if already assigned
	var existing models.ProjectMember
	if err := h.db.Where("project_id = ? AND user_id = ?", member.ProjectID, member.UserID).First(&existing).Error; err == nil {
		existing.RoleInProject = member.RoleInProject
		existing.Notes = member.Notes
		h.db.Save(&existing)
		h.db.Preload("User").First(&existing, existing.ID)
		c.JSON(http.StatusOK, existing)
		return
	}

	if err := h.db.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Preload("User").First(&member, member.ID)
	c.JSON(http.StatusCreated, member)
}

func (h *TeamHandler) RemoveMemberFromProject(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.ProjectMember{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Penugasan anggota tim berhasil dihapus"})
}
