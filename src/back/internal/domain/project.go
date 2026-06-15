package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

const (
	ProjectStatusDraft    = "draft"
	ProjectStatusPending  = "pending"
	ProjectStatusActive   = "active"
	ProjectStatusFunded   = "funded"
	ProjectStatusComplete = "completed"
	ProjectStatusBlocked  = "blocked"
	ProjectStatusRejected = "rejected"
)

type Project struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CompanyID      uuid.UUID `gorm:"type:uuid;not null;index" json:"company_id"`
	EntrepreneurID uuid.UUID `gorm:"type:uuid;not null;index" json:"entrepreneur_id"`
	Title          string    `gorm:"not null" json:"title"`
	Description    string    `gorm:"type:text" json:"description"`
	FundingGoal    float64   `gorm:"not null" json:"funding_goal"`
	FundingRaised  float64   `gorm:"default:0" json:"funding_raised"`
	Currency       string    `gorm:"not null;default:XOF" json:"currency"`
	Status         string    `gorm:"not null;default:draft" json:"status"`
	Category       string    `json:"category"`
	CoverImageUrl  string    `json:"cover_image_url"`
	StartDate      *time.Time `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	Company      Company      `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Entrepreneur Entrepreneur `gorm:"foreignKey:EntrepreneurID" json:"entrepreneur,omitempty"`
	Milestones   []Milestone  `gorm:"foreignKey:ProjectID" json:"milestones,omitempty"`
	Investments  []Investment `gorm:"foreignKey:ProjectID" json:"investments,omitempty"`
}

const (
	MilestoneStatusPending     = "pending"
	MilestoneStatusActive      = "active"
	MilestoneStatusUnderReview = "under_review"
	MilestoneStatusApproved    = "approved"
	MilestoneStatusRejected    = "rejected"
	MilestoneStatusPaid        = "paid"
)

type Milestone struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"project_id"`
	Title          string         `gorm:"not null" json:"title"`
	Description    string         `gorm:"type:text" json:"description"`
	OrderNum       int            `gorm:"not null" json:"order_num"`
	FundAllocation float64        `gorm:"not null" json:"fund_allocation"`
	Status         string         `gorm:"not null;default:pending" json:"status"`
	DueDate        *time.Time     `json:"due_date"`
	ProofDocs      datatypes.JSON `gorm:"type:jsonb" json:"proof_docs"`
	ProofNotes     string         `gorm:"type:text" json:"proof_notes"`
	AdminFeedback  string         `gorm:"type:text" json:"admin_feedback"`
	ReviewedBy     *uuid.UUID     `gorm:"type:uuid" json:"reviewed_by"`
	ReviewedAt     *time.Time     `json:"reviewed_at"`
	PaidAt         *time.Time     `json:"paid_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`

	Project Project `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
}
