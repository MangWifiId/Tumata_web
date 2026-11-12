package database

import (
	"fmt"
	"log"

	"tumata-backend/internal/config"
	"tumata-backend/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) *gorm.DB {
	var db *gorm.DB
	var err error

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	if cfg.DBType == "postgres" {
		dsn := cfg.DatabaseURL
		if dsn == "" {
			dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
				cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode)
		}
		log.Println("[DB Info] Connecting to PostgreSQL database (Neon / Cloud)...")
		db, err = gorm.Open(postgres.Open(dsn), gormConfig)
		if err != nil {
			log.Printf("[DB Warning] Failed to connect to PostgreSQL (%v). Falling back to pure-Go SQLite for seamless operation.", err)
			db, err = gorm.Open(sqlite.Open("tumata.db"), gormConfig)
		} else {
			log.Println("[DB Info] Successfully connected to PostgreSQL database!")
		}
	} else {
		log.Println("[DB Info] Connecting to SQLite database (tumata.db)...")
		db, err = gorm.Open(sqlite.Open("tumata.db"), gormConfig)
	}

	if err != nil {
		log.Fatalf("[DB Fatal] Failed to initialize database: %v", err)
	}

	// Run Auto Migration
	err = db.AutoMigrate(
		&models.User{},
		&models.StudioSetting{},
		&models.Client{},
		&models.Package{},
		&models.Project{},
		&models.Event{},
		&models.ProjectMember{},
		&models.Task{},
		&models.MeetingNote{},
		&models.NoteAction{},
		&models.Invoice{},
		&models.InvoiceItem{},
		&models.Payment{},
		&models.Expense{},
		&models.Document{},
		&models.DocumentLog{},
	)
	if err != nil {
		log.Fatalf("[DB Fatal] AutoMigrate failed: %v", err)
	}

	DB = db

	// Seed initial data
	SeedInitialData(db)

	return db
}
