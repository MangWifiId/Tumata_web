package services

import (
	"fmt"
	"net/url"
	"strings"

	"tumata-backend/internal/models"
)

type WhatsAppService struct{}

func NewWhatsAppService() *WhatsAppService {
	return &WhatsAppService{}
}

// CleanPhoneNumber formats an Indonesian phone number to international 62 format
func (s *WhatsAppService) CleanPhoneNumber(phone string) string {
	cleaned := strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' {
			return r
		}
		return -1
	}, phone)

	if strings.HasPrefix(cleaned, "0") {
		cleaned = "62" + cleaned[1:]
	} else if strings.HasPrefix(cleaned, "8") {
		cleaned = "62" + cleaned
	}
	return cleaned
}

func (s *WhatsAppService) GenerateInvoiceMessage(setting *models.StudioSetting, client *models.Client, invoice *models.Invoice) string {
	studioName := "TUMATA Wedding Studio"
	bankInfo := ""
	if setting != nil {
		if setting.StudioName != "" {
			studioName = setting.StudioName
		}
		bankInfo = fmt.Sprintf("\n💳 *Informasi Rekening Pembayaran:*\nBank: %s\nNo. Rekening: %s\nAtas Nama: %s\n",
			setting.BankName, setting.BankAccount, setting.BankHolder)
	}

	clientName := client.Name
	if client.BrideName != "" && client.GroomName != "" {
		clientName = fmt.Sprintf("%s & %s", client.BrideName, client.GroomName)
	}

	msg := fmt.Sprintf(`Halo Kak %s, salam hangat dari *%s* ✨

Terima kasih atas kepercayaan Kakak kepada studio kami. Bersama ini kami kirimkan dokumen tagihan *Invoice*:

📄 *No. Invoice:* %s
📅 *Jatuh Tempo:* %s
💰 *Total Tagihan:* Rp %s
💵 *Sudah Dibayar:* Rp %s
🏷️ *Sisa Tagihan:* Rp %s
%s
Silakan unduh dokumen invoice PDF yang kami lampirkan untuk rincian selengkapnya. Jika pembayaran telah dilakukan, mohon konfirmasi dengan mengirimkan bukti transfer di pesan ini.

Terima kasih banyak, semoga persiapan pernikahannya berjalan lancar selalu! 🙏✨`,
		clientName,
		studioName,
		invoice.InvoiceNumber,
		invoice.DueDate.Format("02 January 2006"),
		formatRupiah(invoice.TotalAmount),
		formatRupiah(invoice.PaidAmount),
		formatRupiah(invoice.RemainingAmount),
		bankInfo,
	)

	return msg
}

func (s *WhatsAppService) GenerateReceiptMessage(setting *models.StudioSetting, client *models.Client, payment *models.Payment) string {
	studioName := "TUMATA Wedding Studio"
	if setting != nil && setting.StudioName != "" {
		studioName = setting.StudioName
	}

	clientName := client.Name
	if client.BrideName != "" && client.GroomName != "" {
		clientName = fmt.Sprintf("%s & %s", client.BrideName, client.GroomName)
	}

	msg := fmt.Sprintf(`Halo Kak %s, salam hangat dari *%s* ✨

Pembayaran Kakak telah kami terima dan diverifikasi dengan baik. Berikut rincian *Kwitansi Pembayaran Resmi*:

🧾 *No. Kwitansi:* %s
📅 *Tanggal Bayar:* %s
💵 *Nominal Diterima:* Rp %s
🔖 *Jenis Pembayaran:* %s
🏦 *Metode Pembayaran:* %s
📌 *No. Referensi:* %s

Dokumen kwitansi PDF resmi telah kami lampirkan bersama pesan ini sebagai bukti sah. Terima kasih atas kerja samanya! 🙏✨`,
		clientName,
		studioName,
		payment.ReceiptNumber,
		payment.PaymentDate.Format("02 January 2006"),
		formatRupiah(payment.Amount),
		string(payment.PaymentType),
		string(payment.PaymentMethod),
		payment.ReferenceNumber,
	)

	return msg
}

func (s *WhatsAppService) GenerateQuotationMessage(setting *models.StudioSetting, client *models.Client, project *models.Project) string {
	studioName := "TUMATA Wedding Studio"
	if setting != nil && setting.StudioName != "" {
		studioName = setting.StudioName
	}

	clientName := client.Name
	if client.BrideName != "" && client.GroomName != "" {
		clientName = fmt.Sprintf("%s & %s", client.BrideName, client.GroomName)
	}

	packageName := "Paket Dokumentasi Pernikahan"
	if project.Package != nil {
		packageName = project.Package.Name
	}

	msg := fmt.Sprintf(`Halo Kak %s, salam hangat dari *%s* ✨

Terima kasih telah menghubungi kami. Kami telah menyiapkan penawaran paket dokumentasi spesial untuk pernikahan Kakak:

💍 *Paket Pilihan:* %s
💵 *Nilai Investasi:* Rp %s
📅 *Tanggal Acara:* %s
📍 *Lokasi:* %s

Detail lengkap rincian layanan, fasilitas yang didapat, dan portfolio telah kami lampirkan dalam dokumen Penawaran PDF.

Silakan pelajari dan jangan ragu untuk berdiskusi jika ada permintaan khusus atau penyesuaian paket. Kami siap membantu mengabadikan momen terbaik Kakak! ✨📸`,
		clientName,
		studioName,
		packageName,
		formatRupiah(project.ContractValue),
		func() string {
			if project.EventDate != nil {
				return project.EventDate.Format("02 January 2006")
			}
			return "-"
		}(),
		project.VenueName,
	)

	return msg
}

func (s *WhatsAppService) GenerateWhatsAppURL(phone, message string) string {
	cleanPhone := s.CleanPhoneNumber(phone)
	encoded := url.QueryEscape(message)
	return fmt.Sprintf("https://wa.me/%s?text=%s", cleanPhone, encoded)
}

func formatRupiah(amount float64) string {
	// Simple thousand separator formatting for IDR
	str := fmt.Sprintf("%.0f", amount)
	n := len(str)
	if n <= 3 {
		return str
	}
	var res []string
	rem := n % 3
	if rem > 0 {
		res = append(res, str[:rem])
	}
	for i := rem; i < n; i += 3 {
		res = append(res, str[i:i+3])
	}
	return strings.Join(res, ".")
}
