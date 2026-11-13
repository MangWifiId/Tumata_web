package database

import (
	"log"
	"time"

	"tumata-backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedInitialData(db *gorm.DB) {
	// 1. Studio Settings
	var settingCount int64
	db.Model(&models.StudioSetting{}).Count(&settingCount)
	if settingCount == 0 {
		db.Create(&models.StudioSetting{
			StudioName: "TUMATA Wedding Studio",
			Tagline:    "Capturing Every Sacred Moment with Elegance & Soul",
			Address:    "Jl. Melati Indah No. 88, Kebayoran Baru, Jakarta Selatan",
			Phone:      "+62 812-3456-7890",
			WhatsApp:   "6281234567890",
			Email:      "hello@tumatawedding.com",
			BankName:   "Bank Central Asia (BCA)",
			BankAccount: "8830192831",
			BankHolder: "TUMATA CREATIVE STUDIO",
			SignerName: "Dimas Anggara",
			SignerRole: "Studio Director & Lead Artist",
			TermsAndConditions: "1. Pembayaran DP minimal 30% dari nilai kontrak untuk mengunci slot tanggal acara.\n2. Pembayaran termin kedua (30%) sebelum pelaksanaan technical meeting.\n3. Pelunasan sisa tagihan (40%) dilakukan maksimal 7 hari sebelum hari H acara.\n4. Seleksi dan editing foto diproses selama 14-21 hari kerja setelah pemilihan foto favorit oleh klien.\n5. Hasil akhir diserahkan berupa Cloud Gallery resolusi tinggi dan Exclusive Wooden USB Box.",
			LogoPath:   "assets/tumata-logo.png",
		})
		log.Println("[Seed] Studio settings initialized")
	}

	// 2. Users
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		hashPassword := func(pwd string) string {
			h, _ := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
			return string(h)
		}

		users := []models.User{
			{
				Name:         "Dimas Anggara",
				Email:        "admin@tumata.com",
				PasswordHash: hashPassword("admin123"),
				Role:         models.RoleAdmin,
				Phone:        "081234567890",
			},
			{
				Name:         "Budi Santoso",
				Email:        "budi@tumata.com",
				PasswordHash: hashPassword("budi123"),
				Role:         models.RolePhotographer,
				Phone:        "081298765431",
			},
			{
				Name:         "Reza Pratama",
				Email:        "reza@tumata.com",
				PasswordHash: hashPassword("reza123"),
				Role:         models.RoleVideographer,
				Phone:        "081298765432",
			},
			{
				Name:         "Siti Rahayu",
				Email:        "siti@tumata.com",
				PasswordHash: hashPassword("siti123"),
				Role:         models.RolePhotoEditor,
				Phone:        "081298765433",
			},
			{
				Name:         "Dani Firmansyah",
				Email:        "dani@tumata.com",
				PasswordHash: hashPassword("dani123"),
				Role:         models.RoleVideoEditor,
				Phone:        "081298765434",
			},
			{
				Name:         "Maya Wulandari",
				Email:        "maya@tumata.com",
				PasswordHash: hashPassword("maya123"),
				Role:         models.RoleCoordinator,
				Phone:        "081298765435",
			},
		}

		for _, u := range users {
			db.Create(&u)
		}
		log.Println("[Seed] Default users initialized")
	}

	// 3. Packages
	var packageCount int64
	db.Model(&models.Package{}).Count(&packageCount)
	if packageCount == 0 {
		packages := []models.Package{
			{
				Name:        "Silver Moments (Akad Only)",
				Category:    models.CatAkad,
				Price:       6500000,
				Description: "Paket dokumentasi fokus upacara akad nikah dengan sentuhan hangat dan natural.",
				Features:    "1 Fotografer & 1 Videografer Senior\nDurasi liputan maksimal 4 jam\n50 Foto edited tone cinematic\nTeaser video 60 detik (Reels/TikTok format)\nSemua file foto original dalam Google Drive\nFlashdisk kayu eksklusif 32GB",
				IsActive:    true,
			},
			{
				Name:        "Golden Union (Akad & Resepsi)",
				Category:    models.CatResepsi,
				Price:       14500000,
				Description: "Dokumentasi lengkap momen sakral akad hingga kemeriahan resepsi pernikahan.",
				Features:    "2 Fotografer & 2 Videografer\nDurasi liputan hingga 8 jam\n100 Foto edited & album kolase magnetik 20x30 cm\nVideo Cinematic 3-5 menit + Video Dokumentasi 15-20 menit\nTeaser video 60 detik\nSemua master foto & video",
				IsActive:    true,
			},
			{
				Name:        "Platinum Royal Celebration",
				Category:    models.CatAllIn,
				Price:       25000000,
				Description: "Paket all-inclusive prestisius meliputi Prewedding, Akad, Resepsi, dan Aerial Drone.",
				Features:    "Sesi Prewedding Outdoor 1 Hari (termasuk makeup & 2 outfit)\n3 Fotografer & 3 Videografer + 1 Pilot Drone 4K\nDurasi liputan seharian (full-day coverage)\n2 Album Magazine Eksklusif 30x40 cm dengan leather box\n2 Kanvas Cetak 60x90 cm dengan bingkai minimalis emas\nCinematic Highlight Movie 5-7 menit & Full Documentary 30 menit\nSame Day Edit (SDE) teaser siap tayang di resepsi",
				IsActive:    true,
			},
			{
				Name:        "Intimate Prewedding Session",
				Category:    models.CatPrewedding,
				Price:       5000000,
				Description: "Sesi foto prewedding konsep intimate outdoor/indoor di lokasi favorit Anda.",
				Features:    "1 Fotografer Senior & 1 Asisten Pencahayaan\nDurasi sesi foto 4-5 jam (2 lokasi / 2 konsep)\n30 Foto fine-art retouched\n1 Frame Cetak Pembesar 50x75 cm\nSemua file JPEG resolusi tinggi",
				IsActive:    true,
			},
		}

		for _, p := range packages {
			db.Create(&p)
		}
		log.Println("[Seed] Packages initialized")
	}

	// 4. Sample Clients & Projects
	var clientCount int64
	db.Model(&models.Client{}).Count(&clientCount)
	if clientCount == 0 {
		client1 := models.Client{
			Name:            "Raditya & Jessica",
			BrideName:       "Jessica Veranda",
			GroomName:       "Raditya Pratama",
			WhatsApp:        "6281211112222",
			Email:           "jessica.radit@example.com",
			Address:         "Kebayoran Baru, Jakarta Selatan",
			Instagram:       "@jessica_v",
			Source:          models.SourceInstagram,
			Notes:           "Menyukai tone warm earthy dan candid moments.",
			SpecialRequests: "Wajib dokumentasikan momen sungkeman dengan detail dan keluarga inti dari kedua belah pihak.",
		}
		db.Create(&client1)

		client2 := models.Client{
			Name:            "Fajar & Nabila",
			BrideName:       "Nabila Syakieb",
			GroomName:       "Fajar Nugroho",
			WhatsApp:        "6281233334444",
			Email:           "fajar.nabila@example.com",
			Address:         "BSD City, Tangerang Selatan",
			Instagram:       "@fajarnugraha",
			Source:          models.SourceRekomendasi,
			Notes:           "Tema pernikahan adat Jawa modern, pencahayaan panggung dramatis.",
			SpecialRequests: "Foto formil dengan tamu VIP dan keluarga besar dipisahkan dengan jelas.",
		}
		db.Create(&client2)

		now := time.Now()
		eventDate1 := now.AddDate(0, 0, 15) // 15 days later
		eventDate2 := now.AddDate(0, 0, 3)  // 3 days later

		var pkgGolden models.Package
		db.First(&pkgGolden, "name LIKE ?", "%Golden Union%")
		var pkgPlatinum models.Package
		db.First(&pkgPlatinum, "name LIKE ?", "%Platinum Royal%")

		var userDimas models.User
		db.First(&userDimas, "email = ?", "admin@tumata.com")
		var userBudi models.User
		db.First(&userBudi, "email = ?", "budi@tumata.com")
		var userReza models.User
		db.First(&userReza, "email = ?", "reza@tumata.com")
		var userSiti models.User
		db.First(&userSiti, "email = ?", "siti@tumata.com")
		var userDani models.User
		db.First(&userDani, "email = ?", "dani@tumata.com")

		// Project 1
		p1 := models.Project{
			ProjectNumber:   "PRJ-202611-001",
			ClientID:        client1.ID,
			PackageID:       &pkgPlatinum.ID,
			ContractValue:   pkgPlatinum.Price,
			Status:          models.StatusPersiapan,
			EventDate:       &eventDate1,
			EventStartTime:  "07:30",
			EventEndTime:    "14:00",
			VenueName:       "The Manor Andara",
			VenueAddress:    "Jl. Andara Raya No. 1, Cilandak, Jakarta Selatan",
			PICID:           &userDimas.ID,
			Notes:           "Paket Platinum Royal, persiapan rundown bersama koordinator.",
			SpecialRequests: "Ada sesi pelepasan balon dan drone aerial saat kirab pengantin.",
		}
		db.Create(&p1)

		// Create standard 10 production workflow stages for Project 1
		stages := []struct {
			Stage       int
			Title       string
			Description string
			AssigneeID  *uint
			Status      models.TaskStatus
		}{
			{1, "Pengambilan Foto & Video", "Liputan lapangan hari H sesuai rundown acara", &userBudi.ID, models.TaskPending},
			{2, "Backup File & Ingest", "Penyalinan file memory card ke SSD editing & cloud backup", &userSiti.ID, models.TaskPending},
			{3, "Seleksi Foto", "Kurasi foto terbaik dan pemilihan untuk album", &userSiti.ID, models.TaskPending},
			{4, "Editing Foto", "Color grading fine-art tone & skin retouching", &userSiti.ID, models.TaskPending},
			{5, "Editing Video", "Assembly cut, color grading, dan audio mixing cinematic highlight", &userDani.ID, models.TaskPending},
			{6, "Review Internal", "Quality check warna, resolusi, dan alur cerita oleh PIC studio", &userDimas.ID, models.TaskPending},
			{7, "Revisi Klien", "Klien meninjau draf video dan request revisi minor jika ada", &userDimas.ID, models.TaskPending},
			{8, "Finalisasi & Cetak", "Proses cetak album kolase magnetik, cetak kanvas, dan export video 4K master", &userSiti.ID, models.TaskPending},
			{9, "Pengiriman Hasil", "Pengiriman link Cloud Gallery dan pengemasan wooden box flashdisk", &userDimas.ID, models.TaskPending},
			{10, "Konfirmasi Penyerahan", "Klien menerima seluruh paket dokumentasi dan konfirmasi kepuasan", &userDimas.ID, models.TaskPending},
		}

		for _, s := range stages {
			taskDeadline := eventDate1.AddDate(0, 0, s.Stage*2)
			db.Create(&models.Task{
				ProjectID:   p1.ID,
				Stage:       s.Stage,
				Title:       s.Title,
				Description: s.Description,
				AssigneeID:  s.AssigneeID,
				Status:      s.Status,
				Deadline:    &taskDeadline,
			})
		}

		// Project 1 Events
		akadStart := time.Date(eventDate1.Year(), eventDate1.Month(), eventDate1.Day(), 8, 0, 0, 0, time.Local)
		akadEnd := time.Date(eventDate1.Year(), eventDate1.Month(), eventDate1.Day(), 10, 30, 0, 0, time.Local)
		db.Create(&models.Event{
			ProjectID: p1.ID,
			Title:     "Akad Nikah Raditya & Jessica",
			EventType: models.EventAkad,
			StartTime: akadStart,
			EndTime:   akadEnd,
			Location:  "The Manor Andara - Glass House",
			Notes:     "Fotografer & videografer standby 07:00 WIB untuk liputan makeup.",
		})

		resepsiStart := time.Date(eventDate1.Year(), eventDate1.Month(), eventDate1.Day(), 11, 0, 0, 0, time.Local)
		resepsiEnd := time.Date(eventDate1.Year(), eventDate1.Month(), eventDate1.Day(), 14, 0, 0, 0, time.Local)
		db.Create(&models.Event{
			ProjectID: p1.ID,
			Title:     "Resepsi Pernikahan Raditya & Jessica",
			EventType: models.EventResepsi,
			StartTime: resepsiStart,
			EndTime:   resepsiEnd,
			Location:  "The Manor Andara - Main Ballroom & Lawn",
			Notes:     "Liputan prosesi kirab pengantin dan live feeding screen.",
		})

		// Project 1 Invoices & Payments
		inv1 := models.Invoice{
			InvoiceNumber:   "INV-202611-001",
			ProjectID:       p1.ID,
			IssueDate:       now.AddDate(0, 0, -10),
			DueDate:         now.AddDate(0, 0, 10),
			TotalAmount:     pkgPlatinum.Price,
			PaidAmount:      10000000,
			RemainingAmount: pkgPlatinum.Price - 10000000,
			Status:          models.InvoicePartial,
			Notes:           "Invoice pelunasan dapat dibayarkan H-7 sebelum acara pernikahan.",
			Terms:           "Pembayaran sah apabila ditransfer ke rekening BCA atas nama TUMATA CREATIVE STUDIO.",
		}
		db.Create(&inv1)

		db.Create(&models.InvoiceItem{
			InvoiceID:   inv1.ID,
			Description: "Paket Platinum Royal Celebration - Full Day Wedding & Prewedding",
			Quantity:    1,
			UnitPrice:   pkgPlatinum.Price,
			Subtotal:    pkgPlatinum.Price,
		})

		// Payment DP
		payDate := now.AddDate(0, 0, -9)
		db.Create(&models.Payment{
			ProjectID:       p1.ID,
			InvoiceID:       &inv1.ID,
			ReceiptNumber:   "KWT-202611-001",
			Amount:          10000000,
			PaymentType:     models.PaymentDP,
			PaymentMethod:   models.MethodTransfer,
			PaymentDate:     payDate,
			ReferenceNumber: "BCA-TRX-98231948",
			IsVerified:      true,
			VerifiedAt:      &payDate,
			Notes:           "Pembayaran DP 40% telah terverifikasi via Mutasi Rekening BCA.",
		})

		// Meeting Note
		note1 := models.MeetingNote{
			ProjectID:       p1.ID,
			MeetingDate:     now.AddDate(0, 0, -3),
			Participants:    "Jessica, Raditya, Dimas (Studio PIC), Maya (Koordinator)",
			Topic:           "Technical Meeting & Penyelarasan Rundown Acara",
			SpecialRequests: "Fotografer wajib fokus mengambil ekspresi orang tua saat ijab kabul.",
			Agreements:      "Tim dokumentasi datang jam 07:00 pagi di ruang rias pengantin wanita.",
			CreatedByID:     userDimas.ID,
		}
		db.Create(&note1)

		actionDeadline := now.AddDate(0, 0, 5)
		db.Create(&models.NoteAction{
			MeetingNoteID: note1.ID,
			ActionItem:    "Kirimkan draft rundown final dan kontak PIC keluarga ke grup WhatsApp",
			AssigneeID:    &userDimas.ID,
			Deadline:      &actionDeadline,
			IsDone:        true,
		})

		// Project 1 Expenses
		db.Create(&models.Expense{
			ProjectID: &p1.ID,
			Category:  models.ExpHonorTim,
			Title:     "Uang Muka Honor Tim Fotografer & Videografer",
			Amount:    2500000,
			Date:      now.AddDate(0, 0, -2),
			PaidTo:    "Budi Santoso & Tim",
			Notes:     "DP operasional lapangan",
		})

		// Project 2 (Fajar & Nabila)
		p2 := models.Project{
			ProjectNumber:   "PRJ-202611-002",
			ClientID:        client2.ID,
			PackageID:       &pkgGolden.ID,
			ContractValue:   pkgGolden.Price,
			Status:          models.StatusEditing,
			EventDate:       &eventDate2,
			EventStartTime:  "09:00",
			EventEndTime:    "15:00",
			VenueName:       "Grand Ballroom ICE BSD",
			VenueAddress:    "Jl. BSD Grand Boulevard, Tangerang Selatan",
			PICID:           &userBudi.ID,
			Notes:           "Liputan selesai dengan lancar, saat ini dalam tahap seleksi dan editing warna.",
			SpecialRequests: "Warna kebaya pengantin (sage green) harus terlihat akurat dan natural.",
		}
		db.Create(&p2)

		// Create tasks for Project 2 with progress
		for _, s := range stages {
			status := models.TaskCompleted
			if s.Stage > 4 {
				status = models.TaskInProgress
			}
			if s.Stage > 5 {
				status = models.TaskPending
			}
			dl := eventDate2.AddDate(0, 0, s.Stage)
			db.Create(&models.Task{
				ProjectID:   p2.ID,
				Stage:       s.Stage,
				Title:       s.Title,
				Description: s.Description,
				AssigneeID:  s.AssigneeID,
				Status:      status,
				Deadline:    &dl,
			})
		}

		// Project 2 Events
		p2EventStart := time.Date(eventDate2.Year(), eventDate2.Month(), eventDate2.Day(), 9, 0, 0, 0, time.Local)
		p2EventEnd := time.Date(eventDate2.Year(), eventDate2.Month(), eventDate2.Day(), 14, 0, 0, 0, time.Local)
		db.Create(&models.Event{
			ProjectID: p2.ID,
			Title:     "Akad & Resepsi Fajar & Nabila",
			EventType: models.EventResepsi,
			StartTime: p2EventStart,
			EndTime:   p2EventEnd,
			Location:  "Grand Ballroom ICE BSD",
			Notes:     "Liputan adat Jawa modern dengan 2 kamera foto dan 2 kamera video.",
		})

		// Project 2 Invoice fully paid
		inv2 := models.Invoice{
			InvoiceNumber:   "INV-202611-002",
			ProjectID:       p2.ID,
			IssueDate:       now.AddDate(0, 0, -20),
			DueDate:         now.AddDate(0, 0, -5),
			TotalAmount:     pkgGolden.Price,
			PaidAmount:      pkgGolden.Price,
			RemainingAmount: 0,
			Status:          models.InvoicePaid,
			Notes:           "Lunas 100%. Kwitansi pelunasan telah diterbitkan.",
		}
		db.Create(&inv2)

		db.Create(&models.InvoiceItem{
			InvoiceID:   inv2.ID,
			Description: "Paket Golden Union (Akad & Resepsi)",
			Quantity:    1,
			UnitPrice:   pkgGolden.Price,
			Subtotal:    pkgGolden.Price,
		})

		pay2Date := now.AddDate(0, 0, -6)
		db.Create(&models.Payment{
			ProjectID:       p2.ID,
			InvoiceID:       &inv2.ID,
			ReceiptNumber:   "KWT-202611-002",
			Amount:          pkgGolden.Price,
			PaymentType:     models.PaymentPelunasan,
			PaymentMethod:   models.MethodTransfer,
			PaymentDate:     pay2Date,
			ReferenceNumber: "MANDIRI-TRX-55123901",
			IsVerified:      true,
			VerifiedAt:      &pay2Date,
			Notes:           "Pelunasan diterima via transfer Bank Mandiri.",
		})

		log.Println("[Seed] Sample clients, projects, tasks, events, and finances initialized successfully")
	}

	// 4. Backfill demo project members (idempotent: only when the table is empty)
	var memberCount int64
	db.Model(&models.ProjectMember{}).Count(&memberCount)
	if memberCount == 0 {
		var projects []models.Project
		db.Order("id asc").Find(&projects)

		if len(projects) > 0 {
			var users []models.User
			db.Order("id asc").Find(&users)

			roleLabel := map[models.UserRole]string{
				models.RoleAdmin:        "Studio Director",
				models.RoleOwner:        "Pemilik Studio",
				models.RolePhotographer: "Fotografer",
				models.RoleVideographer: "Videografer",
				models.RolePhotoEditor:  "Editor Foto",
				models.RoleVideoEditor:  "Editor Video",
				models.RoleCoordinator:  "Koordinator Acara",
			}

			created := 0
			for i, u := range users {
				// Admin/pemilik already see everything; only staff need assignments.
				if u.Role == models.RoleAdmin || u.Role == models.RoleOwner {
					continue
				}
				p := projects[i%len(projects)]
				member := models.ProjectMember{
					ProjectID:     p.ID,
					UserID:        u.ID,
					RoleInProject: roleLabel[u.Role],
					Notes:         "Ditambahkan otomatis sebagai data demo.",
				}
				if err := db.Create(&member).Error; err == nil {
					created++
				}
			}
			if created > 0 {
				log.Printf("[Seed] Backfilled %d project members for demo accounts", created)
			}
		}
	}
}
