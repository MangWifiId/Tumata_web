package routes

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"tumata-backend/internal/config"
	"tumata-backend/internal/handlers"
	"tumata-backend/internal/middleware"
	"tumata-backend/internal/models"
	"tumata-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS Setup
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Static routes
	r.Static("/uploads", cfg.UploadDir)

	distDir := "../frontend/dist"
	if fi, err := os.Stat(distDir); err == nil && fi.IsDir() {
		r.Static("/assets", filepath.Join(distDir, "assets"))
	} else {
		r.Static("/assets", cfg.AssetsDir)
	}

	// Services
	authService := services.NewAuthService(cfg.JWTSecret)
	conflictService := services.NewConflictService(db)
	whatsAppService := services.NewWhatsAppService()
	pdfService := services.NewPDFService(db, cfg.UploadDir, cfg.AssetsDir)

	// Handlers
	authHandler := handlers.NewAuthHandler(db, authService)
	clientHandler := handlers.NewClientHandler(db)
	packageHandler := handlers.NewPackageHandler(db)
	projectHandler := handlers.NewProjectHandler(db)
	eventHandler := handlers.NewEventHandler(db, conflictService)
	taskHandler := handlers.NewTaskHandler(db)
	noteHandler := handlers.NewNoteHandler(db)
	financeHandler := handlers.NewFinanceHandler(db)
	documentHandler := handlers.NewDocumentHandler(db, pdfService, whatsAppService)
	settingHandler := handlers.NewSettingHandler(db)
	teamHandler := handlers.NewTeamHandler(db)
	dashboardHandler := handlers.NewDashboardHandler(db)

	api := r.Group("/api")
	{
		// Public Auth
		api.POST("/auth/login", authHandler.Login)

		// Public PDF Download (easy for browser print & download)
		api.GET("/documents/:id/download", documentHandler.DownloadDocument)

		// Protected Routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(authService))
		{
			adminOnly := middleware.RequireRole(models.RoleAdmin, models.RoleOwner)

			// Auth & Profile
			protected.GET("/auth/profile", authHandler.GetProfile)
			protected.GET("/users", authHandler.GetUsers)
			protected.POST("/users", adminOnly, authHandler.CreateUser)

			// Dashboard
			protected.GET("/dashboard/metrics", dashboardHandler.GetMetrics)

			// Clients
			protected.GET("/clients", clientHandler.GetClients)
			protected.GET("/clients/:id", clientHandler.GetClientByID)
			protected.POST("/clients", clientHandler.CreateClient)
			protected.PUT("/clients/:id", clientHandler.UpdateClient)
			protected.DELETE("/clients/:id", clientHandler.DeleteClient)

			// Packages
			protected.GET("/packages", packageHandler.GetPackages)
			protected.POST("/packages", packageHandler.CreatePackage)
			protected.PUT("/packages/:id", packageHandler.UpdatePackage)
			protected.DELETE("/packages/:id", packageHandler.DeletePackage)

			// Projects
			protected.GET("/projects", projectHandler.GetProjects)
			protected.GET("/projects/:id", projectHandler.GetProjectByID)
			protected.POST("/projects", projectHandler.CreateProject)
			protected.PUT("/projects/:id", projectHandler.UpdateProject)
			protected.DELETE("/projects/:id", projectHandler.DeleteProject)

			// Events & Calendar
			protected.GET("/events", eventHandler.GetEvents)
			protected.POST("/events", eventHandler.CreateEvent)
			protected.PUT("/events/:id", eventHandler.UpdateEvent)
			protected.DELETE("/events/:id", eventHandler.DeleteEvent)
			protected.POST("/events/check-conflict", eventHandler.CheckConflicts)

			// Tasks & Production Stages
			protected.GET("/tasks", taskHandler.GetTasks)
			protected.PUT("/tasks/:id", taskHandler.UpdateTask)
			protected.PATCH("/tasks/:id/status", taskHandler.UpdateTaskStatus)

			// Meeting Notes
			protected.GET("/notes", noteHandler.GetNotes)
			protected.POST("/notes", noteHandler.CreateNote)
			protected.DELETE("/notes/:id", noteHandler.DeleteNote)
			protected.PATCH("/notes/actions/:action_id/toggle", noteHandler.ToggleActionItem)

			// Finance (admin/owner only)
			finance := protected.Group("/finance")
			finance.Use(adminOnly)
			{
				finance.GET("/invoices", financeHandler.GetInvoices)
				finance.POST("/invoices", financeHandler.CreateInvoice)
				finance.GET("/payments", financeHandler.GetPayments)
				finance.POST("/payments", financeHandler.CreatePayment)
				finance.PATCH("/payments/:id/verify", financeHandler.VerifyPayment)
				finance.GET("/expenses", financeHandler.GetExpenses)
				finance.POST("/expenses", financeHandler.CreateExpense)
				finance.DELETE("/expenses/:id", financeHandler.DeleteExpense)
				finance.GET("/report", financeHandler.GetFinancialReport)
			}

			// Documents & PDF
			protected.GET("/documents", documentHandler.GetDocuments)
			protected.POST("/documents/generate", documentHandler.GenerateDocument)
			protected.GET("/documents/:id/whatsapp-link", documentHandler.GetWhatsAppLink)

			// Team
			protected.GET("/team", teamHandler.GetTeamMembers)
			protected.POST("/team/assign", teamHandler.AssignMemberToProject)
			protected.DELETE("/team/assign/:id", teamHandler.RemoveMemberFromProject)

			// Settings (admin/owner only)
			settings := protected.Group("/settings")
			settings.Use(adminOnly)
			{
				settings.GET("", settingHandler.GetSettings)
				settings.PUT("", settingHandler.UpdateSettings)
			}
		}
	}

	// Serve Frontend Single Page Application (SPA)
	if fi, err := os.Stat(distDir); err == nil && fi.IsDir() {
		r.NoRoute(func(c *gin.Context) {
			path := c.Request.URL.Path
			if strings.HasPrefix(path, "/api") {
				c.JSON(http.StatusNotFound, gin.H{"error": "Endpoint API tidak ditemukan"})
				return
			}
			// Check if file exists in dist
			targetFile := filepath.Join(distDir, path)
			if stat, err := os.Stat(targetFile); err == nil && !stat.IsDir() {
				c.File(targetFile)
				return
			}
			c.File(filepath.Join(distDir, "index.html"))
		})
	}

	return r
}
