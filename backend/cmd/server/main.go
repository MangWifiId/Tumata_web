package main

import (
	"fmt"
	"log"
	"os"

	"tumata-backend/internal/config"
	"tumata-backend/internal/database"
	"tumata-backend/internal/routes"
)

func main() {
	cfg := config.LoadConfig()

	// Ensure upload folders
	_ = os.MkdirAll(cfg.UploadDir, 0755)
	_ = os.MkdirAll(fmt.Sprintf("%s/documents", cfg.UploadDir), 0755)

	db := database.InitDB(cfg)
	router := routes.SetupRouter(db, cfg)

	log.Printf("==================================================")
	log.Printf("   TUMATA Wedding Studio Management Backend API   ")
	log.Printf("   Running on http://localhost:%s                 ", cfg.Port)
	log.Printf("   Database: %s                                   ", cfg.DBType)
	log.Printf("==================================================")

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
