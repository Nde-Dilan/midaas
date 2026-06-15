package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type CompanyLegalDocs struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CompanyID          uuid.UUID      `gorm:"type:uuid;uniqueIndex;not null" json:"company_id"`
	RccmNumber         string         `json:"rccm_number"`
	RccmExpiryDate     *time.Time     `json:"rccm_expiry_date"`
	RccmDocs           datatypes.JSON `gorm:"type:jsonb" json:"rccm_docs"`
	NiuNumber          string         `json:"niu_number"`
	NiuDocUrl          string         `json:"niu_doc_url"`
	StatutsDocs        datatypes.JSON `gorm:"type:jsonb" json:"statuts_docs"`
	LocalisationDocUrl string         `json:"localisation_doc_url"`
	PremisesPhotos     datatypes.JSON `gorm:"type:jsonb" json:"premises_photos"`
	SectorPermits      datatypes.JSON `gorm:"type:jsonb" json:"sector_permits"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`

	Company *Company `gorm:"foreignKey:CompanyID" json:"-"`
}
