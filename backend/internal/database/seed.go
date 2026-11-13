package database

import (
	"tumata-backend/internal/models"

	"gorm.io/gorm"
)

// SeedInitialData only ensures a studio settings row exists.
//
// Demo users, clients, projects, tasks, and financial records are intentionally
// NOT seeded anymore. The database must contain real studio data only. The
// owner account is created once and additional accounts are managed from the
// "Daftar Akun" page.
func SeedInitialData(db *gorm.DB) {
	var settingCount int64
	db.Model(&models.StudioSetting{}).Count(&settingCount)
	if settingCount == 0 {
		db.Create(&models.StudioSetting{StudioName: "TUMATA"})
	}
}
