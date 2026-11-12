package handlers

import (
	"fmt"
	"net/http"
	"os"

	"tumata-backend/internal/models"
	"tumata-backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DocumentHandler struct {
	db              *gorm.DB
	pdfService      *services.PDFService
	whatsAppService *services.WhatsAppService
}

func NewDocumentHandler(db *gorm.DB, pdfService *services.PDFService, whatsAppService *services.WhatsAppService) *DocumentHandler {
	return &DocumentHandler{
		db:              db,
		pdfService:      pdfService,
		whatsAppService: whatsAppService,
	}
}

func (h *DocumentHandler) GetDocuments(c *gin.Context) {
	projectID := c.Query("project_id")
	clientID := c.Query("client_id")
	docType := c.Query("doc_type")

	var docs []models.Document
	query := h.db.Preload("Project.Client").Preload("Client").Order("created_at desc")

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	if clientID != "" {
		query = query.Where("client_id = ?", clientID)
	}
	if docType != "" {
		query = query.Where("doc_type = ?", docType)
	}

	if err := query.Find(&docs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, docs)
}

func (h *DocumentHandler) GenerateDocument(c *gin.Context) {
	var req struct {
		DocType models.DocType `json:"doc_type" binding:"required"`
		RefID   uint           `json:"ref_id" binding:"required"` // invoice_id, payment_id, or project_id
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var filePath string
	var doc *models.Document
	var err error

	switch req.DocType {
	case models.DocInvoice:
		filePath, doc, err = h.pdfService.GenerateInvoicePDF(req.RefID)
	case models.DocReceipt:
		// Check verified status first (Section 5.4 / 8.7 rule: only verified payments can have receipts!)
		var payment models.Payment
		if err := h.db.First(&payment, req.RefID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data pembayaran tidak ditemukan"})
			return
		}
		if !payment.IsVerified {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Kwitansi hanya dapat diterbitkan untuk pembayaran yang telah diverifikasi"})
			return
		}
		filePath, doc, err = h.pdfService.GenerateReceiptPDF(req.RefID)
	case models.DocQuotation:
		filePath, doc, err = h.pdfService.GenerateQuotationPDF(req.RefID)
	case models.DocContract:
		filePath, doc, err = h.pdfService.GenerateContractPDF(req.RefID)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jenis dokumen tidak valid"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal membuat PDF: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Dokumen berhasil diterbitkan",
		"file_path": filePath,
		"document":  doc,
	})
}

func (h *DocumentHandler) DownloadDocument(c *gin.Context) {
	id := c.Param("id")
	var doc models.Document

	if err := h.db.First(&doc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dokumen tidak ditemukan"})
		return
	}

	if _, err := os.Stat(doc.FilePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File PDF dokumen tidak ditemukan di server"})
		return
	}

	// Log download
	h.db.Create(&models.DocumentLog{
		DocumentID: doc.ID,
		Action:     "downloaded",
		Details:    "File PDF diunduh oleh admin",
	})

	c.File(doc.FilePath)
}

func (h *DocumentHandler) GetWhatsAppLink(c *gin.Context) {
	id := c.Param("id")
	var doc models.Document

	if err := h.db.Preload("Project.Client").Preload("Client").First(&doc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dokumen tidak ditemukan"})
		return
	}

	var setting models.StudioSetting
	h.db.First(&setting)

	client := doc.Client
	if client == nil && doc.Project != nil {
		client = doc.Project.Client
	}

	if client == nil || client.WhatsApp == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nomor WhatsApp klien tidak tersedia"})
		return
	}

	var message string
	switch doc.DocType {
	case models.DocInvoice:
		var invoice models.Invoice
		if err := h.db.Where("invoice_number = ?", doc.DocumentNumber).First(&invoice).Error; err == nil {
			message = h.whatsAppService.GenerateInvoiceMessage(&setting, client, &invoice)
		}
	case models.DocReceipt:
		var payment models.Payment
		if err := h.db.Where("receipt_number = ?", doc.DocumentNumber).First(&payment).Error; err == nil {
			message = h.whatsAppService.GenerateReceiptMessage(&setting, client, &payment)
		}
	case models.DocQuotation:
		if doc.Project != nil {
			message = h.whatsAppService.GenerateQuotationMessage(&setting, client, doc.Project)
		}
	case models.DocContract:
		message = fmt.Sprintf("Halo Kak %s, berikut kami lampirkan dokumen Kontrak Kerja Resmi No. %s untuk layanan dokumentasi pernikahan bersama %s. Mohon ditinjau. Terima kasih banyak!",
			client.Name, doc.DocumentNumber, setting.StudioName)
	}

	if message == "" {
		message = fmt.Sprintf("Halo Kak %s, terlampir dokumen %s No: %s dari %s.",
			client.Name, doc.DocType, doc.DocumentNumber, setting.StudioName)
	}

	waURL := h.whatsAppService.GenerateWhatsAppURL(client.WhatsApp, message)

	// Log WhatsApp shared
	h.db.Create(&models.DocumentLog{
		DocumentID: doc.ID,
		Action:     "whatsapp_shared",
		Details:    fmt.Sprintf("Pesan WhatsApp siap kirim dibuka ke nomor %s", client.WhatsApp),
	})

	c.JSON(http.StatusOK, gin.H{
		"whatsapp_url": waURL,
		"message_text": message,
		"client_phone": client.WhatsApp,
	})
}
