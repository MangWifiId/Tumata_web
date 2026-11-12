package handlers

import (
	"fmt"
	"net/http"
	"time"

	"tumata-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FinanceHandler struct {
	db *gorm.DB
}

func NewFinanceHandler(db *gorm.DB) *FinanceHandler {
	return &FinanceHandler{db: db}
}

// Invoices
func (h *FinanceHandler) GetInvoices(c *gin.Context) {
	projectID := c.Query("project_id")
	status := c.Query("status")

	var invoices []models.Invoice
	query := h.db.Preload("Project.Client").Preload("Items").Order("created_at desc")

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&invoices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invoices)
}

func (h *FinanceHandler) CreateInvoice(c *gin.Context) {
	var req struct {
		ProjectID uint                 `json:"project_id" binding:"required"`
		IssueDate time.Time            `json:"issue_date" binding:"required"`
		DueDate   time.Time            `json:"due_date" binding:"required"`
		Notes     string               `json:"notes"`
		Terms     string               `json:"terms"`
		Items     []models.InvoiceItem `json:"items" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Auto generate invoice number: INV-YYYYMM-XXX
	now := time.Now()
	prefix := fmt.Sprintf("INV-%s", now.Format("200601"))
	var count int64
	h.db.Model(&models.Invoice{}).Where("invoice_number LIKE ?", prefix+"%").Count(&count)
	invNumber := fmt.Sprintf("%s-%03d", prefix, count+1)

	var totalAmount float64
	for i := range req.Items {
		req.Items[i].Subtotal = float64(req.Items[i].Quantity) * req.Items[i].UnitPrice
		totalAmount += req.Items[i].Subtotal
	}

	invoice := models.Invoice{
		InvoiceNumber:   invNumber,
		ProjectID:       req.ProjectID,
		IssueDate:       req.IssueDate,
		DueDate:         req.DueDate,
		TotalAmount:     totalAmount,
		PaidAmount:      0,
		RemainingAmount: totalAmount,
		Status:          models.InvoiceUnpaid,
		Notes:           req.Notes,
		Terms:           req.Terms,
	}

	if err := h.db.Create(&invoice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, itm := range req.Items {
		itm.InvoiceID = invoice.ID
		h.db.Create(&itm)
	}

	h.db.Preload("Project.Client").Preload("Items").First(&invoice, invoice.ID)
	c.JSON(http.StatusCreated, invoice)
}

// Payments
func (h *FinanceHandler) GetPayments(c *gin.Context) {
	projectID := c.Query("project_id")
	invoiceID := c.Query("invoice_id")

	var payments []models.Payment
	query := h.db.Preload("Project.Client").Preload("Invoice").Order("payment_date desc")

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	if invoiceID != "" {
		query = query.Where("invoice_id = ?", invoiceID)
	}

	if err := query.Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}

func (h *FinanceHandler) CreatePayment(c *gin.Context) {
	var req struct {
		ProjectID       uint                 `json:"project_id" binding:"required"`
		InvoiceID       *uint                `json:"invoice_id"`
		Amount          float64              `json:"amount" binding:"required,gt=0"`
		PaymentType     models.PaymentType   `json:"payment_type" binding:"required"`
		PaymentMethod   models.PaymentMethod `json:"payment_method" binding:"required"`
		PaymentDate     time.Time            `json:"payment_date" binding:"required"`
		ReferenceNumber string               `json:"reference_number"`
		ProofImage      string               `json:"proof_image"`
		IsVerified      bool                 `json:"is_verified"`
		Notes           string               `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Auto generate Receipt Number: KWT-YYYYMM-XXX
	now := time.Now()
	prefix := fmt.Sprintf("KWT-%s", now.Format("200601"))
	var count int64
	h.db.Model(&models.Payment{}).Where("receipt_number LIKE ?", prefix+"%").Count(&count)
	rcptNumber := fmt.Sprintf("%s-%03d", prefix, count+1)

	var verifiedAt *time.Time
	if req.IsVerified {
		t := time.Now()
		verifiedAt = &t
	}

	payment := models.Payment{
		ProjectID:       req.ProjectID,
		InvoiceID:       req.InvoiceID,
		ReceiptNumber:   rcptNumber,
		Amount:          req.Amount,
		PaymentType:     req.PaymentType,
		PaymentMethod:   req.PaymentMethod,
		PaymentDate:     req.PaymentDate,
		ReferenceNumber: req.ReferenceNumber,
		ProofImage:      req.ProofImage,
		IsVerified:      req.IsVerified,
		VerifiedAt:      verifiedAt,
		Notes:           req.Notes,
	}

	if err := h.db.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If verified, update the invoice totals
	if payment.IsVerified && payment.InvoiceID != nil {
		h.recalculateInvoice(*payment.InvoiceID)
	}

	h.db.Preload("Project.Client").Preload("Invoice").First(&payment, payment.ID)
	c.JSON(http.StatusCreated, payment)
}

func (h *FinanceHandler) VerifyPayment(c *gin.Context) {
	id := c.Param("id")
	var payment models.Payment

	if err := h.db.First(&payment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pembayaran tidak ditemukan"})
		return
	}

	now := time.Now()
	payment.IsVerified = true
	payment.VerifiedAt = &now

	if err := h.db.Save(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if payment.InvoiceID != nil {
		h.recalculateInvoice(*payment.InvoiceID)
	}

	h.db.Preload("Project.Client").Preload("Invoice").First(&payment, payment.ID)
	c.JSON(http.StatusOK, payment)
}

func (h *FinanceHandler) recalculateInvoice(invoiceID uint) {
	var invoice models.Invoice
	if err := h.db.First(&invoice, invoiceID).Error; err != nil {
		return
	}

	var totalVerifiedPaid float64
	h.db.Model(&models.Payment{}).
		Where("invoice_id = ? AND is_verified = ?", invoiceID, true).
		Select("COALESCE(SUM(amount), 0)").Scan(&totalVerifiedPaid)

	invoice.PaidAmount = totalVerifiedPaid
	invoice.RemainingAmount = invoice.TotalAmount - totalVerifiedPaid
	if invoice.RemainingAmount < 0 {
		invoice.RemainingAmount = 0
	}

	if invoice.RemainingAmount == 0 && invoice.TotalAmount > 0 {
		invoice.Status = models.InvoicePaid
	} else if invoice.PaidAmount > 0 {
		invoice.Status = models.InvoicePartial
	} else {
		invoice.Status = models.InvoiceUnpaid
	}

	h.db.Save(&invoice)
}

// Expenses
func (h *FinanceHandler) GetExpenses(c *gin.Context) {
	projectID := c.Query("project_id")
	category := c.Query("category")

	var expenses []models.Expense
	query := h.db.Preload("Project.Client").Order("date desc")

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	if err := query.Find(&expenses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, expenses)
}

func (h *FinanceHandler) CreateExpense(c *gin.Context) {
	var expense models.Expense
	if err := c.ShouldBindJSON(&expense); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&expense).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Preload("Project.Client").First(&expense, expense.ID)
	c.JSON(http.StatusCreated, expense)
}

func (h *FinanceHandler) DeleteExpense(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.Expense{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pengeluaran berhasil dihapus"})
}

// Reports
func (h *FinanceHandler) GetFinancialReport(c *gin.Context) {
	var totalContract float64
	h.db.Model(&models.Project{}).Select("COALESCE(SUM(contract_value), 0)").Scan(&totalContract)

	var totalVerifiedRevenue float64
	h.db.Model(&models.Payment{}).Where("is_verified = ?", true).Select("COALESCE(SUM(amount), 0)").Scan(&totalVerifiedRevenue)

	var totalExpenses float64
	h.db.Model(&models.Expense{}).Select("COALESCE(SUM(amount), 0)").Scan(&totalExpenses)

	totalReceivable := totalContract - totalVerifiedRevenue
	if totalReceivable < 0 {
		totalReceivable = 0
	}
	netProfit := totalVerifiedRevenue - totalExpenses

	// Expenses by category
	type CategorySum struct {
		Category models.ExpenseCategory `json:"category"`
		Total    float64                `json:"total"`
	}
	var expenseBreakdown []CategorySum
	h.db.Model(&models.Expense{}).
		Select("category, SUM(amount) as total").
		Group("category").
		Scan(&expenseBreakdown)

	c.JSON(http.StatusOK, gin.H{
		"total_contracts":        totalContract,
		"total_verified_revenue": totalVerifiedRevenue,
		"total_receivable":       totalReceivable,
		"total_expenses":         totalExpenses,
		"net_profit":             netProfit,
		"expense_breakdown":      expenseBreakdown,
	})
}
