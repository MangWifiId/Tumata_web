package handlers

import (
	"net/http"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ClientHandler struct {
	db *gorm.DB
}

func NewClientHandler(db *gorm.DB) *ClientHandler {
	return &ClientHandler{db: db}
}

func (h *ClientHandler) GetClients(c *gin.Context) {
	search := c.Query("search")
	var clients []models.Client

	query := h.db.Preload("Projects.Package").Preload("Documents").Order("created_at desc")
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("name LIKE ? OR bride_name LIKE ? OR groom_name LIKE ? OR whatsapp LIKE ?", s, s, s, s)
	}

	if err := query.Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, clients)
}

func (h *ClientHandler) GetClientByID(c *gin.Context) {
	id := c.Param("id")
	var client models.Client

	if err := h.db.Preload("Projects.Package").Preload("Projects.Events").Preload("Projects.Invoices").Preload("Documents").First(&client, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Klien tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, client)
}

func (h *ClientHandler) CreateClient(c *gin.Context) {
	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, client)
}

func (h *ClientHandler) UpdateClient(c *gin.Context) {
	id := c.Param("id")
	var client models.Client

	if err := h.db.First(&client, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Klien tidak ditemukan"})
		return
	}

	var updateData models.Client
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	client.Name = updateData.Name
	client.BrideName = updateData.BrideName
	client.GroomName = updateData.GroomName
	client.WhatsApp = updateData.WhatsApp
	client.Email = updateData.Email
	client.Address = updateData.Address
	client.Instagram = updateData.Instagram
	client.Source = updateData.Source
	client.Notes = updateData.Notes
	client.SpecialRequests = updateData.SpecialRequests

	if err := h.db.Save(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, client)
}

func (h *ClientHandler) DeleteClient(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.Client{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Klien berhasil dihapus"})
}
