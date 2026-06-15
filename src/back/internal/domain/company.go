package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	CorporateFormETS  = "ETS"
	CorporateFormSARL = "SARL"
	CorporateFormSA   = "SA"
	CorporateFormSAS  = "SAS"
)

type Company struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	LegalName       string         `gorm:"not null" json:"legal_name"`
	TradeName       string         `json:"trade_name"`
	CorporateForm   string         `gorm:"not null" json:"corporate_form"`
	IndustrySector  string         `json:"industry_sector"`
	GpsCoordinates  string         `json:"gps_coordinates"`
	PhysicalAddress string         `gorm:"type:text" json:"physical_address"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	LegalDocs        *CompanyLegalDocs  `gorm:"foreignKey:CompanyID" json:"legal_docs,omitempty"`
	Financials       *CompanyFinancials `gorm:"foreignKey:CompanyID" json:"financials,omitempty"`
	BeneficialOwners []BeneficialOwner  `gorm:"foreignKey:CompanyID" json:"beneficial_owners,omitempty"`
	Managers         []CompanyManager   `gorm:"foreignKey:CompanyID" json:"managers,omitempty"`
	Operations       *CompanyOperations `gorm:"foreignKey:CompanyID" json:"operations,omitempty"`
}
