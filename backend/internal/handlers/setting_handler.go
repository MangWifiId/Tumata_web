package handlers

import (
	"net/http"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SettingHandler struct {
	db *gorm.DB
}

func NewSettingHandler(db *gorm.DB) *SettingHandler {
	return &SettingHandler{db: db}
}

func (h *SettingHandler) GetSettings(c *gin.Context) {
	var setting models.StudioSetting
	if err := h.db.First(&setting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengaturan studio belum diset"})
		return
	}
	c.JSON(http.StatusOK, setting)
}

func (h *SettingHandler) UpdateSettings(c *gin.Context) {
	var setting models.StudioSetting
	if err := h.db.First(&setting).Error; err != nil {
		// Create if not exists
		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		h.db.Create(&setting)
		c.JSON(http.StatusOK, setting)
		return
	}

	if err := c.ShouldBindJSON(&setting); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, setting)
}
