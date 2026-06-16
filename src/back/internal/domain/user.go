package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	EntrepreneurStatusPending   = "pending"
	EntrepreneurStatusActive    = "active"
	EntrepreneurStatusRejected  = "rejected"
	EntrepreneurStatusSuspended = "suspended"
)

type User struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email          string         `gorm:"uniqueIndex;not null" json:"email"`
	PhoneNumber    string         `json:"phone_number"`
	HashPassword   string         `gorm:"not null" json:"-"`
	FullName       string         `gorm:"not null" json:"full_name"`
	IdCardUrl      string         `json:"id_card_url"`
	IdCardBackUrl  string         `json:"id_card_back_url"`
	IdCardNumber   string         `json:"id_card_number"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Entrepreneur  *Entrepreneur `gorm:"foreignKey:UserID" json:"entrepreneur,omitempty"`
	Investments   []Investment  `gorm:"foreignKey:UserID" json:"investments,omitempty"`
	Transactions  []Transaction `gorm:"foreignKey:UserID" json:"transactions,omitempty"`
}

type Entrepreneur struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"user_id"`
	Status    string    `gorm:"not null;default:active" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Companies []Company `gorm:"foreignKey:EntrepreneurID" json:"companies,omitempty"`
	Projects  []Project `gorm:"foreignKey:EntrepreneurID" json:"projects,omitempty"`
}
