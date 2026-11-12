package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DBType      string
	DatabaseURL string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	JWTSecret   string
	UploadDir   string
	AssetsDir   string
}

func LoadConfig() *Config {
	// Try loading .env from multiple probable locations
	_ = godotenv.Load(".env", "backend/.env", "../.env")

	port := getEnv("PORT", "8080")

	// Detect Database URL (handles DATABASE_URL, NEON_URL, or neon key)
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("NEON_URL")
	}
	if databaseURL == "" {
		databaseURL = os.Getenv("neon")
	}
	databaseURL = strings.TrimSpace(databaseURL)
	databaseURL = strings.Trim(databaseURL, "\"")

	dbType := getEnv("DB_TYPE", "sqlite")
	if databaseURL != "" || os.Getenv("DB_HOST") != "" {
		dbType = "postgres"
	}

	return &Config{
		Port:        port,
		DBType:      dbType,
		DatabaseURL: databaseURL,
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "postgres"),
		DBName:      getEnv("DB_NAME", "tumata_db"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
		JWTSecret:   getEnv("JWT_SECRET", "tumata-super-secret-wedding-studio-key-2026"),
		UploadDir:   getEnv("UPLOAD_DIR", "./uploads"),
		AssetsDir:   getEnv("ASSETS_DIR", "../assets"),
	}
}

func getEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return strings.TrimSpace(val)
}
