package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type BeneficialOwner struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CompanyID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"company_id"`
	FullName         string         `gorm:"not null" json:"full_name"`
	EquityPercentage float64        `json:"equity_percentage"`
	IdentityDocs     datatypes.JSON `gorm:"type:jsonb" json:"identity_docs"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`

	Company *Company `gorm:"foreignKey:CompanyID" json:"-"`
}

type CompanyManager struct {
	ID                   uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CompanyID            uuid.UUID      `gorm:"type:uuid;not null;index" json:"company_id"`
	FullName             string         `gorm:"not null" json:"full_name"`
	Role                 string         `json:"role"`
	IdentityDocs         datatypes.JSON `gorm:"type:jsonb" json:"identity_docs"`
	CasierJudiciaireUrl  string         `json:"casier_judiciaire_url"`
	CasierJudiciaireDate *time.Time     `json:"casier_judiciaire_date"`
	CvUrl                string         `json:"cv_url"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`

	Company *Company `gorm:"foreignKey:CompanyID" json:"-"`
}
