package models

import (
	"time"
)

type UserRole string

const (
	RoleAdmin       UserRole = "admin"
	RolePhotographer UserRole = "fotografer"
	RoleVideographer UserRole = "videografer"
	RolePhotoEditor  UserRole = "editor foto"
	RoleVideoEditor  UserRole = "editor video"
	RoleCoordinator  UserRole = "koordinator"
	RoleOwner        UserRole = "pemilik"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"size:120;not null" json:"name"`
	Email        string    `gorm:"size:120;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         UserRole  `gorm:"size:40;default:'fotografer'" json:"role"`
	Phone        string    `gorm:"size:30" json:"phone"`
	Avatar       string    `gorm:"size:255" json:"avatar"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type StudioSetting struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	StudioName         string    `gorm:"size:150;not null" json:"studio_name"`
	Tagline            string    `gorm:"size:255" json:"tagline"`
	Address            string    `gorm:"type:text" json:"address"`
	Phone              string    `gorm:"size:30" json:"phone"`
	WhatsApp           string    `gorm:"size:30" json:"whatsapp"`
	Email              string    `gorm:"size:120" json:"email"`
	BankName           string    `gorm:"size:80" json:"bank_name"`
	BankAccount        string    `gorm:"size:60" json:"bank_account"`
	BankHolder         string    `gorm:"size:120" json:"bank_holder"`
	SignerName         string    `gorm:"size:120" json:"signer_name"`
	SignerRole         string    `gorm:"size:80" json:"signer_role"`
	TermsAndConditions string    `gorm:"type:text" json:"terms_and_conditions"`
	LogoPath           string    `gorm:"size:255" json:"logo_path"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type ClientSource string

const (
	SourceInstagram   ClientSource = "Instagram"
	SourceTikTok      ClientSource = "TikTok"
	SourceRekomendasi ClientSource = "Rekomendasi"
	SourceWalkIn      ClientSource = "Walk-in"
	SourceWebsite     ClientSource = "Website"
	SourceLainnya     ClientSource = "Lainnya"
)

type Client struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	Name            string         `gorm:"size:150;not null" json:"name"`
	BrideName       string         `gorm:"size:120" json:"bride_name"`
	GroomName       string         `gorm:"size:120" json:"groom_name"`
	WhatsApp        string         `gorm:"size:30;not null" json:"whatsapp"`
	Email           string         `gorm:"size:120" json:"email"`
	Address         string         `gorm:"type:text" json:"address"`
	Instagram       string         `gorm:"size:100" json:"instagram"`
	Source          ClientSource   `gorm:"size:50;default:'Instagram'" json:"source"`
	Notes           string         `gorm:"type:text" json:"notes"`
	SpecialRequests string         `gorm:"type:text" json:"special_requests"`
	Projects        []Project      `gorm:"foreignKey:ClientID" json:"projects,omitempty"`
	Documents       []Document     `gorm:"foreignKey:ClientID" json:"documents,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

type PackageCategory string

const (
	CatAkad       PackageCategory = "Akad"
	CatResepsi    PackageCategory = "Resepsi"
	CatPrewedding PackageCategory = "Prewedding"
	CatAllIn      PackageCategory = "All-In"
	CatCustom     PackageCategory = "Custom"
)

type Package struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	Name        string          `gorm:"size:150;not null" json:"name"`
	Category    PackageCategory `gorm:"size:50;not null" json:"category"`
	Price       float64         `gorm:"not null" json:"price"`
	Description string          `gorm:"type:text" json:"description"`
	Features    string          `gorm:"type:text" json:"features"` // Line-separated or JSON
	IsActive    bool            `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type ProjectStatus string

const (
	StatusLead         ProjectStatus = "Lead"
	StatusPenawaran    ProjectStatus = "Penawaran"
	StatusMenungguDP   ProjectStatus = "Menunggu DP"
	StatusBooked       ProjectStatus = "Booked"
	StatusPersiapan    ProjectStatus = "Persiapan"
	StatusBerlangsung  ProjectStatus = "Berlangsung"
	StatusEditing      ProjectStatus = "Editing"
	StatusReviewRevisi ProjectStatus = "Review/Revisi"
	StatusSelesai      ProjectStatus = "Selesai"
	StatusDiarsipkan   ProjectStatus = "Diarsipkan"
)

type Project struct {
	ID              uint            `gorm:"primaryKey" json:"id"`
	ProjectNumber   string          `gorm:"size:50;uniqueIndex;not null" json:"project_number"`
	ClientID        uint            `gorm:"not null;index" json:"client_id"`
	Client          *Client         `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	PackageID       *uint           `gorm:"index" json:"package_id"`
	Package         *Package        `gorm:"foreignKey:PackageID" json:"package,omitempty"`
	ContractValue   float64         `gorm:"default:0" json:"contract_value"`
	Status          ProjectStatus   `gorm:"size:50;default:'Lead'" json:"status"`
	EventDate       *time.Time      `json:"event_date"`
	EventStartTime  string          `gorm:"size:10" json:"event_start_time"` // e.g. "08:00"
	EventEndTime    string          `gorm:"size:10" json:"event_end_time"`   // e.g. "17:00"
	VenueName       string          `gorm:"size:200" json:"venue_name"`
	VenueAddress    string          `gorm:"type:text" json:"venue_address"`
	PICID           *uint           `gorm:"index" json:"pic_id"`
	PIC             *User           `gorm:"foreignKey:PICID" json:"pic,omitempty"`
	Notes           string          `gorm:"type:text" json:"notes"`
	SpecialRequests string          `gorm:"type:text" json:"special_requests"`
	
	// Aggregates / Relations
	Events          []Event         `gorm:"foreignKey:ProjectID" json:"events,omitempty"`
	Tasks           []Task          `gorm:"foreignKey:ProjectID" json:"tasks,omitempty"`
	Members         []ProjectMember `gorm:"foreignKey:ProjectID" json:"members,omitempty"`
	Invoices        []Invoice       `gorm:"foreignKey:ProjectID" json:"invoices,omitempty"`
	Payments        []Payment       `gorm:"foreignKey:ProjectID" json:"payments,omitempty"`
	Expenses        []Expense       `gorm:"foreignKey:ProjectID" json:"expenses,omitempty"`
	MeetingNotes    []MeetingNote   `gorm:"foreignKey:ProjectID" json:"meeting_notes,omitempty"`
	Documents       []Document      `gorm:"foreignKey:ProjectID" json:"documents,omitempty"`

	// Computed financial fields (populated dynamically)
	TotalPaid       float64         `gorm:"-" json:"total_paid"`
	RemainingAmount float64         `gorm:"-" json:"remaining_amount"`
	TotalExpenses   float64         `gorm:"-" json:"total_expenses"`
	Profit          float64         `gorm:"-" json:"profit"`
	ProgressPercent int             `gorm:"-" json:"progress_percent"`

	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

type EventType string

const (
	EventAkad             EventType = "Akad Nikah"
	EventResepsi          EventType = "Resepsi"
	EventPrewedding       EventType = "Prewedding"
	EventMeeting          EventType = "Meeting Klien"
	EventTechnicalMeeting EventType = "Technical Meeting"
	EventShooting         EventType = "Dokumentasi Acara"
	EventDeadlineEditing  EventType = "Deadline Editing"
	EventDeadlineDelivery EventType = "Deadline Penyerahan"
)

type Event struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	ProjectID       uint       `gorm:"not null;index" json:"project_id"`
	Project         *Project   `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Title           string     `gorm:"size:200;not null" json:"title"`
	EventType       EventType  `gorm:"size:60;not null" json:"event_type"`
	StartTime       time.Time  `gorm:"not null;index" json:"start_time"`
	EndTime         time.Time  `gorm:"not null;index" json:"end_time"`
	Location        string     `gorm:"size:255" json:"location"`
	Notes           string     `gorm:"type:text" json:"notes"`
	ConflictWarning string     `gorm:"type:text" json:"conflict_warning,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type ProjectMember struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ProjectID      uint      `gorm:"not null;index" json:"project_id"`
	Project        *Project  `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	UserID         uint      `gorm:"not null;index" json:"user_id"`
	User           *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	RoleInProject  string    `gorm:"size:80" json:"role_in_project"` // e.g. "Lead Photographer", "Drone Operator"
	Notes          string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
}

type TaskStatus string

const (
	TaskPending    TaskStatus = "pending"
	TaskInProgress TaskStatus = "in_progress"
	TaskReview     TaskStatus = "review"
	TaskCompleted  TaskStatus = "completed"
)

type Task struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	ProjectID   uint       `gorm:"not null;index" json:"project_id"`
	Stage       int        `gorm:"not null;default:1" json:"stage"` // 1 - 10 stages
	Title       string     `gorm:"size:200;not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	AssigneeID  *uint      `gorm:"index" json:"assignee_id"`
	Assignee    *User      `gorm:"foreignKey:AssigneeID" json:"assignee,omitempty"`
	Status      TaskStatus `gorm:"size:30;default:'pending'" json:"status"`
	Deadline    *time.Time `json:"deadline"`
	Notes       string     `gorm:"type:text" json:"notes"`
	CompletedAt *time.Time `json:"completed_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type MeetingNote struct {
	ID              uint         `gorm:"primaryKey" json:"id"`
	ProjectID       uint         `gorm:"not null;index" json:"project_id"`
	MeetingDate     time.Time    `gorm:"not null" json:"meeting_date"`
	Participants    string       `gorm:"size:255;not null" json:"participants"`
	Topic           string       `gorm:"size:255;not null" json:"topic"`
	SpecialRequests string       `gorm:"type:text" json:"special_requests"`
	Agreements      string       `gorm:"type:text" json:"agreements"`
	CreatedByID     uint         `gorm:"index" json:"created_by_id"`
	CreatedBy       *User        `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`
	Actions         []NoteAction `gorm:"foreignKey:MeetingNoteID" json:"actions,omitempty"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
}

type NoteAction struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	MeetingNoteID uint       `gorm:"not null;index" json:"meeting_note_id"`
	ActionItem    string     `gorm:"type:text;not null" json:"action_item"`
	AssigneeID    *uint      `gorm:"index" json:"assignee_id"`
	Assignee      *User      `gorm:"foreignKey:AssigneeID" json:"assignee,omitempty"`
	Deadline      *time.Time `json:"deadline"`
	IsDone        bool       `gorm:"default:false" json:"is_done"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type InvoiceStatus string

const (
	InvoiceUnpaid    InvoiceStatus = "unpaid"
	InvoicePartial   InvoiceStatus = "partial"
	InvoicePaid      InvoiceStatus = "paid"
	InvoiceCancelled InvoiceStatus = "cancelled"
)

type Invoice struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	InvoiceNumber   string        `gorm:"size:60;uniqueIndex;not null" json:"invoice_number"`
	ProjectID       uint          `gorm:"not null;index" json:"project_id"`
	Project         *Project      `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	IssueDate       time.Time     `gorm:"not null" json:"issue_date"`
	DueDate         time.Time     `gorm:"not null" json:"due_date"`
	TotalAmount     float64       `gorm:"not null;default:0" json:"total_amount"`
	PaidAmount      float64       `gorm:"not null;default:0" json:"paid_amount"`
	RemainingAmount float64       `gorm:"not null;default:0" json:"remaining_amount"`
	Status          InvoiceStatus `gorm:"size:30;default:'unpaid'" json:"status"`
	Notes           string        `gorm:"type:text" json:"notes"`
	Terms           string        `gorm:"type:text" json:"terms"`
	Items           []InvoiceItem `gorm:"foreignKey:InvoiceID" json:"items,omitempty"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type InvoiceItem struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	InvoiceID   uint    `gorm:"not null;index" json:"invoice_id"`
	Description string  `gorm:"size:255;not null" json:"description"`
	Quantity    int     `gorm:"not null;default:1" json:"quantity"`
	UnitPrice   float64 `gorm:"not null;default:0" json:"unit_price"`
	Subtotal    float64 `gorm:"not null;default:0" json:"subtotal"`
}

type PaymentType string

const (
	PaymentDP       PaymentType = "DP"
	PaymentCicilan  PaymentType = "Cicilan"
	PaymentPelunasan PaymentType = "Pelunasan"
)

type PaymentMethod string

const (
	MethodTransfer PaymentMethod = "Transfer Bank"
	MethodCash     PaymentMethod = "Tunai"
	MethodQRIS     PaymentMethod = "QRIS"
	MethodCard     PaymentMethod = "Kartu Kredit/Debit"
)

type Payment struct {
	ID              uint          `gorm:"primaryKey" json:"id"`
	ProjectID       uint          `gorm:"not null;index" json:"project_id"`
	Project         *Project      `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	InvoiceID       *uint         `gorm:"index" json:"invoice_id"`
	Invoice         *Invoice      `gorm:"foreignKey:InvoiceID" json:"invoice,omitempty"`
	ReceiptNumber   string        `gorm:"size:60;uniqueIndex;not null" json:"receipt_number"`
	Amount          float64       `gorm:"not null" json:"amount"`
	PaymentType     PaymentType   `gorm:"size:30;not null" json:"payment_type"`
	PaymentMethod   PaymentMethod `gorm:"size:50;not null" json:"payment_method"`
	PaymentDate     time.Time     `gorm:"not null" json:"payment_date"`
	ReferenceNumber string        `gorm:"size:100" json:"reference_number"`
	ProofImage      string        `gorm:"size:255" json:"proof_image"`
	IsVerified      bool          `gorm:"default:false" json:"is_verified"`
	VerifiedAt      *time.Time    `json:"verified_at"`
	Notes           string        `gorm:"type:text" json:"notes"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type ExpenseCategory string

const (
	ExpHonorTim    ExpenseCategory = "Honor Tim"
	ExpTransportasi ExpenseCategory = "Transportasi"
	ExpKonsumsi     ExpenseCategory = "Konsumsi"
	ExpSewaAlat     ExpenseCategory = "Sewa Alat"
	ExpCetakAlbum   ExpenseCategory = "Cetak Album/Frame"
	ExpVendorLuar   ExpenseCategory = "Vendor Luar"
	ExpLainnya      ExpenseCategory = "Lain-lain"
)

type Expense struct {
	ID         uint            `gorm:"primaryKey" json:"id"`
	ProjectID  *uint           `gorm:"index" json:"project_id"`
	Project    *Project        `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Category   ExpenseCategory `gorm:"size:60;not null" json:"category"`
	Title      string          `gorm:"size:200;not null" json:"title"`
	Amount     float64         `gorm:"not null" json:"amount"`
	Date       time.Time       `gorm:"not null" json:"date"`
	PaidTo     string          `gorm:"size:150" json:"paid_to"`
	Notes      string          `gorm:"type:text" json:"notes"`
	ProofImage string          `gorm:"size:255" json:"proof_image"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}

type DocType string

const (
	DocQuotation DocType = "penawaran"
	DocInvoice   DocType = "invoice"
	DocReceipt   DocType = "kwitansi"
	DocContract  DocType = "kontrak"
)

type Document struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	DocumentNumber string    `gorm:"size:60;uniqueIndex;not null" json:"document_number"`
	DocType        DocType   `gorm:"size:40;not null" json:"doc_type"`
	ProjectID      uint      `gorm:"not null;index" json:"project_id"`
	Project        *Project  `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	ClientID       uint      `gorm:"not null;index" json:"client_id"`
	Client         *Client   `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	SnapshotJSON   string    `gorm:"type:text" json:"snapshot_json"` // Immutable snapshot of data
	FilePath       string    `gorm:"size:255" json:"file_path"`
	Status         string    `gorm:"size:30;default:'published'" json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type DocumentLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	DocumentID uint      `gorm:"not null;index" json:"document_id"`
	Action     string    `gorm:"size:60;not null" json:"action"` // generated, downloaded, printed, whatsapp_shared
	Details    string    `gorm:"size:255" json:"details"`
	CreatedAt  time.Time `json:"created_at"`
}
