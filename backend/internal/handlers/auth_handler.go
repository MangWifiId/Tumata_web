package handlers

import (
	"net/http"

	"tumata-backend/internal/models"
	"tumata-backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db          *gorm.DB
	authService *services.AuthService
}

func NewAuthHandler(db *gorm.DB, authService *services.AuthService) *AuthHandler {
	return &AuthHandler{db: db, authService: authService}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input tidak valid"})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau kata sandi salah"})
		return
	}

	if !h.authService.CheckPassword(user.PasswordHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau kata sandi salah"})
		return
	}

	token, err := h.authService.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat sesi login"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
			"phone": user.Phone,
		},
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
		"phone": user.Phone,
	})
}

func (h *AuthHandler) GetUsers(c *gin.Context) {
	var users []models.User
	h.db.Find(&users)
	c.JSON(http.StatusOK, users)
}

func (h *AuthHandler) CreateUser(c *gin.Context) {
	var req struct {
		Name     string          `json:"name" binding:"required"`
		Email    string          `json:"email" binding:"required,email"`
		Password string          `json:"password" binding:"required"`
		Role     models.UserRole `json:"role" binding:"required"`
		Phone    string          `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := h.authService.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi"})
		return
	}

	user := models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hash,
		Role:         req.Role,
		Phone:        req.Phone,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// UpdateUser updates account identity (name, email, role, phone) without
// touching the password.
func (h *AuthHandler) UpdateUser(c *gin.Context) {
	var user models.User
	if err := h.db.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun tidak ditemukan"})
		return
	}

	var req struct {
		Name  string          `json:"name" binding:"required"`
		Email string          `json:"email" binding:"required,email"`
		Role  models.UserRole `json:"role" binding:"required"`
		Phone string          `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Never allow the last admin/owner account to be downgraded.
	isAdminRole := func(r models.UserRole) bool {
		return r == models.RoleAdmin || r == models.RoleOwner
	}
	if isAdminRole(user.Role) && !isAdminRole(req.Role) {
		var adminCount int64
		h.db.Model(&models.User{}).Where("role IN ?", []models.UserRole{models.RoleAdmin, models.RoleOwner}).Count(&adminCount)
		if adminCount <= 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Minimal harus ada satu akun admin/pemilik"})
			return
		}
	}

	user.Name = req.Name
	user.Email = req.Email
	user.Role = req.Role
	user.Phone = req.Phone

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah digunakan akun lain"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ResetUserPassword lets an admin set a new password for any account.
func (h *AuthHandler) ResetUserPassword(c *gin.Context) {
	var user models.User
	if err := h.db.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun tidak ditemukan"})
		return
	}

	var req struct {
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kata sandi baru minimal 6 karakter"})
		return
	}

	hash, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi"})
		return
	}

	user.PasswordHash = hash
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kata sandi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kata sandi berhasil diperbarui"})
}

// ChangePassword lets the logged-in user change their own password.
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun tidak ditemukan"})
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kata sandi baru minimal 6 karakter"})
		return
	}

	if !h.authService.CheckPassword(user.PasswordHash, req.CurrentPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kata sandi saat ini salah"})
		return
	}

	hash, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi"})
		return
	}

	user.PasswordHash = hash
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kata sandi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kata sandi berhasil diperbarui"})
}

// DeleteUser removes an account and detaches it from projects, tasks, and
// meeting notes. The last admin/owner account cannot be deleted.
func (h *AuthHandler) DeleteUser(c *gin.Context) {
	currentIDVal, _ := c.Get("user_id")
	currentID, _ := currentIDVal.(uint)

	var user models.User
	if err := h.db.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun tidak ditemukan"})
		return
	}

	if user.ID == currentID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak dapat menghapus akun yang sedang dipakai"})
		return
	}

	if user.Role == models.RoleAdmin || user.Role == models.RoleOwner {
		var adminCount int64
		h.db.Model(&models.User{}).Where("role IN ?", []models.UserRole{models.RoleAdmin, models.RoleOwner}).Count(&adminCount)
		if adminCount <= 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Minimal harus ada satu akun admin/pemilik"})
			return
		}
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", user.ID).Delete(&models.ProjectMember{}).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Project{}).Where("pic_id = ?", user.ID).Update("pic_id", nil).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Task{}).Where("assignee_id = ?", user.ID).Update("assignee_id", nil).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.NoteAction{}).Where("assignee_id = ?", user.ID).Update("assignee_id", nil).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.MeetingNote{}).Where("created_by_id = ?", user.ID).Update("created_by_id", currentID).Error; err != nil {
			return err
		}
		return tx.Delete(&user).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus akun"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Akun berhasil dihapus"})
}
