package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"tumata-backend/internal/models"

	"github.com/go-pdf/fpdf"
	"gorm.io/gorm"
)

type PDFService struct {
	db        *gorm.DB
	uploadDir string
	assetsDir string
}

func NewPDFService(db *gorm.DB, uploadDir, assetsDir string) *PDFService {
	// Ensure upload directory exists
	docsDir := filepath.Join(uploadDir, "documents")
	_ = os.MkdirAll(docsDir, 0755)

	return &PDFService{
		db:        db,
		uploadDir: uploadDir,
		assetsDir: assetsDir,
	}
}

// Brand Colors (Emerald / Forest Green palette)
var (
	colorDarkGreen  = []int{6, 78, 59}     // #064E3B
	colorMainGreen  = []int{4, 120, 87}    // #047857
	colorLightGreen = []int{240, 253, 244} // #F0FDF4
	colorGrayText   = []int{100, 116, 139} // #64748B
	colorDarkText   = []int{30, 41, 59}    // #1E293B
	colorBorder     = []int{226, 232, 240} // #E2E8F0
)

func (s *PDFService) getStudioSetting() *models.StudioSetting {
	var setting models.StudioSetting
	if err := s.db.First(&setting).Error; err != nil {
		// No settings saved yet: use only the studio name, never demo data.
		return &models.StudioSetting{StudioName: "TUMATA"}
	}
	return &setting
}

// drawHeader draws studio logo and identity
func (s *PDFService) drawHeader(pdf *fpdf.Fpdf, title string, setting *models.StudioSetting) {
	// Try logo
	logoPath := filepath.Join(s.assetsDir, "tumata-logo.png")
	if _, err := os.Stat(logoPath); err == nil {
		pdf.ImageOptions(logoPath, 15, 12, 45, 0, false, fpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}, 0, "")
	} else {
		pdf.SetFont("Arial", "B", 18)
		pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
		pdf.SetXY(15, 12)
		pdf.Cell(50, 8, "TUMATA")
	}

	// Document Title on the right
	pdf.SetFont("Arial", "B", 20)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(110, 14)
	pdf.CellFormat(85, 8, strings.ToUpper(title), "", 1, "R", false, 0, "")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.SetXY(110, 23)
	pdf.CellFormat(85, 5, fmt.Sprintf("Dicetak: %s", time.Now().Format("02 Jan 2006 15:04 WIB")), "", 1, "R", false, 0, "")

	// Studio detail text under logo
	contactLine := ""
	if setting.WhatsApp != "" && setting.Email != "" {
		contactLine = fmt.Sprintf("WA: %s | Email: %s", setting.WhatsApp, setting.Email)
	} else if setting.WhatsApp != "" {
		contactLine = fmt.Sprintf("WA: %s", setting.WhatsApp)
	} else if setting.Email != "" {
		contactLine = fmt.Sprintf("Email: %s", setting.Email)
	}
	studioLines := []string{setting.StudioName}
	if contactLine != "" {
		studioLines = append(studioLines, contactLine)
	}
	if setting.Address != "" {
		studioLines = append(studioLines, setting.Address)
	}
	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.SetXY(15, 27)
	pdf.MultiCell(85, 3.8, strings.Join(studioLines, "\n"), "", "L", false)

	// Divider line
	pdf.SetDrawColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	pdf.SetLineWidth(0.8)
	pdf.Line(15, 42, 195, 42)
	pdf.Ln(10)
}

// GenerateInvoicePDF creates an Invoice PDF
func (s *PDFService) GenerateInvoicePDF(invoiceID uint) (string, *models.Document, error) {
	var invoice models.Invoice
	if err := s.db.Preload("Project.Client").Preload("Project.Package").Preload("Items").First(&invoice, invoiceID).Error; err != nil {
		return "", nil, err
	}

	setting := s.getStudioSetting()
	client := invoice.Project.Client

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	s.drawHeader(pdf, "INVOICE TAGIHAN", setting)

	// Info section
	y := 48.0
	pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
	pdf.SetDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
	pdf.Rect(15, y, 88, 30, "FD")
	pdf.Rect(107, y, 88, 30, "FD")

	// Client Info
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(18, y+3)
	pdf.Cell(80, 5, "TAGIHAN KEPADA:")
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetXY(18, y+9)
	pdf.Cell(80, 5, client.Name)
	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.SetXY(18, y+15)
	pdf.Cell(80, 4, fmt.Sprintf("WhatsApp: %s", client.WhatsApp))
	pdf.SetXY(18, y+20)
	pdf.Cell(80, 4, fmt.Sprintf("Alamat: %s", client.Address))

	// Invoice Info
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(110, y+3)
	pdf.Cell(80, 5, "DETAIL INVOICE:")
	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetXY(110, y+9)
	pdf.Cell(80, 4, fmt.Sprintf("No. Invoice: %s", invoice.InvoiceNumber))
	pdf.SetXY(110, y+14)
	pdf.Cell(80, 4, fmt.Sprintf("No. Proyek: %s", invoice.Project.ProjectNumber))
	pdf.SetXY(110, y+19)
	pdf.Cell(80, 4, fmt.Sprintf("Tanggal Terbit: %s", invoice.IssueDate.Format("02 Jan 2006")))
	pdf.SetXY(110, y+24)
	pdf.Cell(80, 4, fmt.Sprintf("Jatuh Tempo: %s", invoice.DueDate.Format("02 Jan 2006")))

	// Items Table
	tableY := 84.0
	pdf.SetXY(15, tableY)
	pdf.SetFillColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Arial", "B", 9)
	pdf.CellFormat(15, 8, "NO", "1", 0, "C", true, 0, "")
	pdf.CellFormat(95, 8, "DESKRIPSI LAYANAN", "1", 0, "L", true, 0, "")
	pdf.CellFormat(20, 8, "QTY", "1", 0, "C", true, 0, "")
	pdf.CellFormat(50, 8, "TOTAL (IDR)", "1", 1, "R", true, 0, "")

	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])

	for idx, item := range invoice.Items {
		pdf.SetX(15)
		pdf.CellFormat(15, 7, fmt.Sprintf("%d", idx+1), "1", 0, "C", false, 0, "")
		pdf.CellFormat(95, 7, item.Description, "1", 0, "L", false, 0, "")
		pdf.CellFormat(20, 7, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(50, 7, formatRupiah(item.Subtotal), "1", 1, "R", false, 0, "")
	}

	// Totals
	pdf.SetFont("Arial", "B", 9)
	pdf.SetX(15)
	pdf.CellFormat(130, 7, "TOTAL KONTRAK / TAGIHAN", "1", 0, "R", false, 0, "")
	pdf.CellFormat(50, 7, "Rp "+formatRupiah(invoice.TotalAmount), "1", 1, "R", false, 0, "")

	pdf.SetX(15)
	pdf.SetTextColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	pdf.CellFormat(130, 7, "PEMBAYARAN DITERIMA", "1", 0, "R", false, 0, "")
	pdf.CellFormat(50, 7, "Rp "+formatRupiah(invoice.PaidAmount), "1", 1, "R", false, 0, "")

	pdf.SetX(15)
	pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
	pdf.SetTextColor(185, 28, 28) // Red accent for remaining
	if invoice.RemainingAmount <= 0 {
		pdf.SetTextColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	}
	pdf.CellFormat(130, 8, "SISA TAGIHAN", "1", 0, "R", true, 0, "")
	pdf.CellFormat(50, 8, "Rp "+formatRupiah(invoice.RemainingAmount), "1", 1, "R", true, 0, "")

	// Payment instructions & Bank Details (only when configured)
	bankY := pdf.GetY() + 8
	bankLines := []string{}
	if setting.BankName != "" {
		bankLines = append(bankLines, fmt.Sprintf("Bank Tujuan : %s", setting.BankName))
	}
	if setting.BankAccount != "" {
		bankLines = append(bankLines, fmt.Sprintf("No. Rekening : %s", setting.BankAccount))
	}
	if setting.BankHolder != "" {
		bankLines = append(bankLines, fmt.Sprintf("Atas Nama    : %s", setting.BankHolder))
	}
	if len(bankLines) > 0 {
		boxHeight := 13 + float64(len(bankLines))*5
		pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
		pdf.Rect(15, bankY, 110, boxHeight, "FD")

		pdf.SetFont("Arial", "B", 9)
		pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
		pdf.SetXY(18, bankY+3)
		pdf.Cell(100, 5, "INSTRUKSI PEMBAYARAN:")
		pdf.SetFont("Arial", "", 8.5)
		pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
		for i, line := range bankLines {
			pdf.SetXY(18, bankY+9+float64(i)*5)
			pdf.Cell(100, 4, line)
		}
		pdf.SetXY(18, bankY+9+float64(len(bankLines))*5)
		pdf.SetFont("Arial", "I", 7.5)
		pdf.Cell(100, 4, "*Harap sertakan nomor invoice pada berita transfer")
	}

	// Signer Box (only when a signer is configured)
	if setting.SignerName != "" || setting.SignerRole != "" {
		pdf.SetFont("Arial", "", 8.5)
		pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
		pdf.SetXY(140, bankY+3)
		pdf.CellFormat(50, 4, "Hormat Kami,", "", 1, "C", false, 0, "")
		pdf.SetXY(140, bankY+20)
		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(50, 4, setting.SignerName, "", 1, "C", false, 0, "")
		pdf.SetFont("Arial", "", 8)
		pdf.SetXY(140, bankY+25)
		pdf.CellFormat(50, 4, setting.SignerRole, "", 1, "C", false, 0, "")
	}

	// Terms at bottom (only when filled in)
	terms := setting.TermsAndConditions
	if invoice.Terms != "" {
		terms = invoice.Terms
	}
	if terms != "" {
		termY := bankY + 38
		pdf.SetXY(15, termY)
		pdf.SetFont("Arial", "B", 8)
		pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
		pdf.Cell(180, 4, "SYARAT & KETENTUAN:")
		pdf.Ln(4)
		pdf.SetFont("Arial", "", 7.5)
		pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
		pdf.MultiCell(180, 3.5, terms, "", "L", false)
	}

	// Save file
	fileName := fmt.Sprintf("Invoice_%s.pdf", strings.ReplaceAll(invoice.InvoiceNumber, "/", "-"))
	filePath := filepath.Join(s.uploadDir, "documents", fileName)
	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", nil, err
	}

	// Create immutable snapshot
	snapshotBytes, _ := json.Marshal(invoice)
	doc := models.Document{
		DocumentNumber: invoice.InvoiceNumber,
		DocType:        models.DocInvoice,
		ProjectID:      invoice.ProjectID,
		ClientID:       client.ID,
		SnapshotJSON:   string(snapshotBytes),
		FilePath:       filepath.ToSlash(filePath),
		Status:         "published",
	}
	s.db.Create(&doc)

	// Document log
	s.db.Create(&models.DocumentLog{
		DocumentID: doc.ID,
		Action:     "generated",
		Details:    fmt.Sprintf("Invoice %s diterbitkan", invoice.InvoiceNumber),
	})

	return filePath, &doc, nil
}

// GenerateReceiptPDF creates a Kwitansi PDF for verified payment
func (s *PDFService) GenerateReceiptPDF(paymentID uint) (string, *models.Document, error) {
	var payment models.Payment
	if err := s.db.Preload("Project.Client").Preload("Project.Package").Preload("Invoice").First(&payment, paymentID).Error; err != nil {
		return "", nil, err
	}

	setting := s.getStudioSetting()
	client := payment.Project.Client

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	s.drawHeader(pdf, "KWITANSI RESMI", setting)

	// Receipt Certificate Box
	y := 48.0
	pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
	pdf.SetDrawColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	pdf.SetLineWidth(0.6)
	pdf.Rect(15, y, 180, 115, "FD")

	pdf.SetFont("Arial", "B", 11)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(20, y+6)
	pdf.Cell(170, 6, fmt.Sprintf("BUKTI PEMBAYARAN SAH — NO: %s", payment.ReceiptNumber))

	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.SetXY(20, y+13)
	pdf.Cell(170, 4, fmt.Sprintf("Tanggal Pembayaran: %s | Status: TERVERIFIKASI", payment.PaymentDate.Format("02 January 2006")))

	pdf.SetDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
	pdf.Line(20, y+19, 190, y+19)

	// Fields
	drawField := func(lbl, val string, top float64, bold bool) {
		pdf.SetXY(20, top)
		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
		pdf.Cell(45, 6, lbl)
		pdf.Cell(5, 6, ":")
		if bold {
			pdf.SetFont("Arial", "B", 9.5)
			pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
		} else {
			pdf.SetFont("Arial", "", 9)
			pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
		}
		pdf.Cell(120, 6, val)
	}

	drawField("Telah Diterima Dari", client.Name, y+23, true)
	drawField("Untuk Pembayaran", fmt.Sprintf("%s (%s)", payment.PaymentType, payment.Project.ProjectNumber), y+31, false)
	drawField("Metode Pembayaran", string(payment.PaymentMethod), y+39, false)
	drawField("Nomor Referensi", payment.ReferenceNumber, y+47, false)

	// Big Amount Box
	pdf.SetFillColor(255, 255, 255)
	pdf.SetDrawColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	pdf.Rect(20, y+56, 170, 18, "FD")
	pdf.SetXY(25, y+58)
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.Cell(40, 6, "JUMLAH DITERIMA :")
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(100, 6, "Rp "+formatRupiah(payment.Amount))
	pdf.SetXY(25, y+65)
	pdf.SetFont("Arial", "I", 8)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.Cell(160, 6, fmt.Sprintf("Catatan: %s", payment.Notes))

	// Verification Stamp & Signer
	pdf.SetXY(20, y+80)
	pdf.SetFont("Arial", "B", 8.5)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.Cell(70, 4, "[ STAMP TERVERIFIKASI ]")
	pdf.SetFont("Arial", "", 8)
	pdf.SetXY(20, y+85)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.Cell(70, 4, setting.StudioName)
	pdf.SetXY(20, y+89)
	pdf.Cell(70, 4, "Finance Department")

	if setting.SignerName != "" || setting.SignerRole != "" {
		pdf.SetXY(120, y+80)
		pdf.SetFont("Arial", "", 8.5)
		pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
		pdf.CellFormat(65, 4, "Penerima Kuasa,", "", 1, "C", false, 0, "")
		pdf.SetXY(120, y+98)
		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(65, 4, setting.SignerName, "", 1, "C", false, 0, "")
		pdf.SetFont("Arial", "", 8)
		pdf.SetXY(120, y+103)
		pdf.CellFormat(65, 4, setting.SignerRole, "", 1, "C", false, 0, "")
	}

	// Save file
	fileName := fmt.Sprintf("Kwitansi_%s.pdf", strings.ReplaceAll(payment.ReceiptNumber, "/", "-"))
	filePath := filepath.Join(s.uploadDir, "documents", fileName)
	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", nil, err
	}

	snapshotBytes, _ := json.Marshal(payment)
	doc := models.Document{
		DocumentNumber: payment.ReceiptNumber,
		DocType:        models.DocReceipt,
		ProjectID:      payment.ProjectID,
		ClientID:       client.ID,
		SnapshotJSON:   string(snapshotBytes),
		FilePath:       filepath.ToSlash(filePath),
		Status:         "published",
	}
	s.db.Create(&doc)

	s.db.Create(&models.DocumentLog{
		DocumentID: doc.ID,
		Action:     "generated",
		Details:    fmt.Sprintf("Kwitansi %s diterbitkan", payment.ReceiptNumber),
	})

	return filePath, &doc, nil
}

// GenerateQuotationPDF creates a Quotation / Penawaran Harga PDF
func (s *PDFService) GenerateQuotationPDF(projectID uint) (string, *models.Document, error) {
	var project models.Project
	if err := s.db.Preload("Client").Preload("Package").First(&project, projectID).Error; err != nil {
		return "", nil, err
	}

	setting := s.getStudioSetting()
	client := project.Client

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	s.drawHeader(pdf, "PENAWARAN HARGA", setting)

	docNumber := fmt.Sprintf("QTO-%s", project.ProjectNumber)

	y := 48.0
	pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
	pdf.SetDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
	pdf.Rect(15, y, 180, 26, "FD")

	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(18, y+3)
	pdf.Cell(80, 5, "DITUJUKAN KEPADA:")
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetXY(18, y+9)
	pdf.Cell(80, 5, client.Name)
	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
	pdf.SetXY(18, y+15)
	pdf.Cell(80, 4, fmt.Sprintf("WhatsApp: %s | Alamat: %s", client.WhatsApp, client.Address))

	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(120, y+3)
	pdf.Cell(70, 5, "INFO PENAWARAN:")
	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetXY(120, y+9)
	pdf.Cell(70, 4, fmt.Sprintf("No: %s", docNumber))
	pdf.SetXY(120, y+14)
	pdf.Cell(70, 4, fmt.Sprintf("Tanggal: %s", time.Now().Format("02 Jan 2006")))
	pdf.SetXY(120, y+19)
	eventStr := "-"
	if project.EventDate != nil {
		eventStr = project.EventDate.Format("02 Jan 2006")
	}
	pdf.Cell(70, 4, fmt.Sprintf("Tanggal Acara: %s", eventStr))

	// Package Presentation Box
	tableY := 80.0
	pdf.SetXY(15, tableY)
	pdf.SetFillColor(colorMainGreen[0], colorMainGreen[1], colorMainGreen[2])
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Arial", "B", 10)
	pkgName := "Paket Wedding Kustom"
	if project.Package != nil {
		pkgName = project.Package.Name
	}
	pdf.CellFormat(180, 9, fmt.Sprintf("PAKET LAYANAN: %s", strings.ToUpper(pkgName)), "1", 1, "L", true, 0, "")

	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])

	features := "Dokumentasi Foto & Video Profesional\nLiputan sesuai kesepakatan"
	if project.Package != nil && project.Package.Features != "" {
		features = project.Package.Features
	}
	lines := strings.Split(features, "\n")
	for _, l := range lines {
		if strings.TrimSpace(l) != "" {
			pdf.SetX(15)
			pdf.CellFormat(10, 6, "•", "L", 0, "C", false, 0, "")
			pdf.CellFormat(170, 6, strings.TrimSpace(l), "R", 1, "L", false, 0, "")
		}
	}

	// Total Investment
	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetX(15)
	pdf.CellFormat(120, 10, "TOTAL NILAI INVESTASI DOKUMENTASI", "1", 0, "R", true, 0, "")
	pdf.CellFormat(60, 10, "Rp "+formatRupiah(project.ContractValue), "1", 1, "R", true, 0, "")

	// Terms and notes (only when filled in)
	if setting.TermsAndConditions != "" {
		tY := pdf.GetY() + 8
		pdf.SetXY(15, tY)
		pdf.SetFont("Arial", "B", 8.5)
		pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
		pdf.Cell(180, 5, "KETENTUAN BOOKING:")
		pdf.Ln(4)
		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(colorGrayText[0], colorGrayText[1], colorGrayText[2])
		pdf.MultiCell(180, 4, setting.TermsAndConditions, "", "L", false)
	}

	// Signer (only when configured)
	if setting.SignerName != "" || setting.SignerRole != "" {
		sY := pdf.GetY() + 8
		pdf.SetXY(120, sY)
		pdf.SetFont("Arial", "", 8.5)
		pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
		pdf.CellFormat(65, 4, "Hormat Kami,", "", 1, "C", false, 0, "")
		pdf.SetXY(120, sY+16)
		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(65, 4, setting.SignerName, "", 1, "C", false, 0, "")
		pdf.SetFont("Arial", "", 8)
		pdf.SetXY(120, sY+21)
		pdf.CellFormat(65, 4, setting.SignerRole, "", 1, "C", false, 0, "")
	}

	fileName := fmt.Sprintf("Penawaran_%s.pdf", strings.ReplaceAll(docNumber, "/", "-"))
	filePath := filepath.Join(s.uploadDir, "documents", fileName)
	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", nil, err
	}

	snapshotBytes, _ := json.Marshal(project)
	doc := models.Document{
		DocumentNumber: docNumber,
		DocType:        models.DocQuotation,
		ProjectID:      project.ID,
		ClientID:       client.ID,
		SnapshotJSON:   string(snapshotBytes),
		FilePath:       filepath.ToSlash(filePath),
		Status:         "published",
	}
	s.db.Create(&doc)

	s.db.Create(&models.DocumentLog{
		DocumentID: doc.ID,
		Action:     "generated",
		Details:    fmt.Sprintf("Penawaran %s diterbitkan", docNumber),
	})

	return filePath, &doc, nil
}

// GenerateContractPDF creates a Kontrak Kerja (Agreement) PDF
func (s *PDFService) GenerateContractPDF(projectID uint) (string, *models.Document, error) {
	var project models.Project
	if err := s.db.Preload("Client").Preload("Package").First(&project, projectID).Error; err != nil {
		return "", nil, err
	}

	setting := s.getStudioSetting()
	client := project.Client

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	s.drawHeader(pdf, "SURAT PERJANJIAN KERJA", setting)

	docNumber := fmt.Sprintf("SPK-%s", project.ProjectNumber)

	y := 48.0
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.SetXY(15, y)
	pdf.Cell(180, 5, fmt.Sprintf("KONTRAK KERJA DOKUMENTASI PERNIKAHAN — NO: %s", docNumber))

	studioParty := setting.StudioName
	if setting.Address != "" {
		studioParty = fmt.Sprintf("%s, beralamat di %s", setting.StudioName, setting.Address)
	}
	clientParty := client.Name
	if client.WhatsApp != "" {
		clientParty = fmt.Sprintf("%s, WhatsApp %s", client.Name, client.WhatsApp)
	}
	if client.Address != "" {
		clientParty = fmt.Sprintf("%s, beralamat di %s", clientParty, client.Address)
	}

	pdf.SetFont("Arial", "", 8.5)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])
	pdf.SetXY(15, y+8)
	pdf.MultiCell(180, 4.5, fmt.Sprintf("Perjanjian ini dibuat pada hari ini, %s, antara pihak-pihak sebagai berikut:\n"+
		"1. PIHAK PERTAMA (Studio): %s, bertindak untuk dan atas nama Studio.\n"+
		"2. PIHAK KEDUA (Klien): %s.\n\n"+
		"Kedua belah pihak telah bersepakat mengenai ketentuan penyediaan jasa dokumentasi pernikahan:",
		time.Now().Format("02 January 2006"), studioParty, clientParty), "", "L", false)

	// Contract detail box
	cY := pdf.GetY() + 4
	pdf.SetFillColor(colorLightGreen[0], colorLightGreen[1], colorLightGreen[2])
	pdf.SetDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
	pdf.Rect(15, cY, 180, 24, "FD")

	pkgName := "Paket Dokumentasi"
	if project.Package != nil {
		pkgName = project.Package.Name
	}
	evDateStr := "-"
	if project.EventDate != nil {
		evDateStr = project.EventDate.Format("02 January 2006")
	}

	pdf.SetFont("Arial", "B", 9)
	pdf.SetXY(18, cY+3)
	pdf.Cell(170, 5, fmt.Sprintf("Paket Layanan: %s", pkgName))
	pdf.SetFont("Arial", "", 8.5)
	pdf.SetXY(18, cY+9)
	pdf.Cell(170, 4, fmt.Sprintf("Tanggal Acara: %s | Jam: %s - %s WIB", evDateStr, project.EventStartTime, project.EventEndTime))
	pdf.SetXY(18, cY+14)
	pdf.Cell(170, 4, fmt.Sprintf("Lokasi Venue: %s (%s)", project.VenueName, project.VenueAddress))
	pdf.SetXY(18, cY+19)
	pdf.SetFont("Arial", "B", 9)
	pdf.Cell(170, 4, fmt.Sprintf("Total Nilai Kontrak: Rp %s", formatRupiah(project.ContractValue)))

	// Clauses
	clauseY := cY + 30
	pdf.SetXY(15, clauseY)
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(colorDarkGreen[0], colorDarkGreen[1], colorDarkGreen[2])
	pdf.Cell(180, 5, "PASAL-PASAL KESEPAKATAN:")
	pdf.Ln(5)
	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(colorDarkText[0], colorDarkText[1], colorDarkText[2])

	clauses := "PASAL 1 — HAK & KEWAJIBAN\n" +
		"Pihak Pertama berkewajiban menyediakan tim dokumentasi profesional, peralatan terbaik, dan menyerahkan hasil karya tepat waktu.\n\n"
	pasal := 2
	if setting.TermsAndConditions != "" {
		clauses += fmt.Sprintf("PASAL %d — SYARAT PEMBAYARAN\n%s\n\n", pasal, setting.TermsAndConditions)
		pasal++
	}
	clauses += fmt.Sprintf("PASAL %d — FORCE MAJEURE & PEMBATALAN\n"+
		"Apabila terjadi force majeure (bencana alam, huru-hara, atau kebijakan darurat pemerintah), kedua belah pihak sepakat merundingkan penjadwalan ulang tanpa penalti.", pasal)
	pdf.MultiCell(180, 4, clauses, "", "L", false)

	// Signatures
	sY := pdf.GetY() + 8
	pdf.SetXY(25, sY)
	pdf.SetFont("Arial", "B", 8.5)
	pdf.CellFormat(50, 4, "PIHAK KEDUA (KLIEN)", "", 1, "C", false, 0, "")
	pdf.SetXY(25, sY+18)
	pdf.CellFormat(50, 4, client.Name, "", 1, "C", false, 0, "")

	if setting.SignerName != "" || setting.SignerRole != "" {
		pdf.SetXY(125, sY)
		pdf.CellFormat(50, 4, "PIHAK PERTAMA (STUDIO)", "", 1, "C", false, 0, "")
		pdf.SetXY(125, sY+18)
		pdf.CellFormat(50, 4, setting.SignerName, "", 1, "C", false, 0, "")
		pdf.SetFont("Arial", "", 8)
		pdf.SetXY(125, sY+22)
		pdf.CellFormat(50, 4, setting.SignerRole, "", 1, "C", false, 0, "")
	}

	fileName := fmt.Sprintf("Kontrak_%s.pdf", strings.ReplaceAll(docNumber, "/", "-"))
	filePath := filepath.Join(s.uploadDir, "documents", fileName)
	if err := pdf.OutputFileAndClose(filePath); err != nil {
		return "", nil, err
	}

	snapshotBytes, _ := json.Marshal(project)
	doc := models.Document{
		DocumentNumber: docNumber,
		DocType:        models.DocContract,
		ProjectID:      project.ID,
		ClientID:       client.ID,
		SnapshotJSON:   string(snapshotBytes),
		FilePath:       filepath.ToSlash(filePath),
		Status:         "published",
	}
	s.db.Create(&doc)

	s.db.Create(&models.DocumentLog{
		DocumentID: doc.ID,
		Action:     "generated",
		Details:    fmt.Sprintf("Kontrak %s ditandatangani & diterbitkan", docNumber),
	})

	return filePath, &doc, nil
}
