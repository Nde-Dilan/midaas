package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type CompanyFinancials struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CompanyID        uuid.UUID      `gorm:"type:uuid;uniqueIndex;not null" json:"company_id"`
	DsfYears         datatypes.JSON `gorm:"type:jsonb" json:"dsf_years"`
	DsfStampedDocs   datatypes.JSON `gorm:"type:jsonb" json:"dsf_stamped_docs"`
	AnrIssueDate     *time.Time     `json:"anr_issue_date"`
	AnrExpiryDate    *time.Time     `json:"anr_expiry_date"`
	AnrDocUrl        string         `json:"anr_doc_url"`
	CnpsClearanceUrl string         `json:"cnps_clearance_url"`
	BankStatements   datatypes.JSON `gorm:"type:jsonb" json:"bank_statements"`
	MomoStatements   datatypes.JSON `gorm:"type:jsonb" json:"momo_statements"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`

	Company *Company `gorm:"foreignKey:CompanyID" json:"-"`
}
