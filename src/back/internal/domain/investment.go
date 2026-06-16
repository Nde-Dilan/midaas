package domain

import (
	"time"

	"github.com/google/uuid"
)

const (
	InvestmentStatusPending   = "pending"
	InvestmentStatusConfirmed = "confirmed"
	InvestmentStatusFailed    = "failed"
	InvestmentStatusRefunded  = "refunded"
)

type Investment struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProjectID        uuid.UUID `gorm:"type:uuid;not null;index" json:"project_id"`
	UserID           uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Amount           float64   `gorm:"not null" json:"amount"`
	Currency         string    `gorm:"not null" json:"currency"`
	OwnershipPct     float64   `json:"ownership_pct"`
	PlatformFeePct   float64   `gorm:"default:5" json:"platform_fee_pct"`
	PlatformFeeAmt   float64   `gorm:"default:0" json:"platform_fee_amt"`
	NetAmount        float64   `gorm:"default:0" json:"net_amount"`
	Status           string    `gorm:"not null;default:pending" json:"status"`
	TransactionRef   string    `json:"transaction_ref"`
	DepositID        string    `json:"deposit_id"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	Project Project `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	User    User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

const (
	TransactionTypeInvestment      = "investment"
	TransactionTypeMilestonePayout = "milestone_payout"
	TransactionTypeRefund          = "refund"

	TransactionDirectionDebit  = "debit"
	TransactionDirectionCredit = "credit"

	TransactionStatusPending   = "pending"
	TransactionStatusCompleted = "completed"
	TransactionStatusFailed    = "failed"
)

type Transaction struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	InvestmentID *uuid.UUID `gorm:"type:uuid;index" json:"investment_id"`
	Type         string     `gorm:"not null" json:"type"`
	Amount       float64    `gorm:"not null" json:"amount"`
	Currency     string     `gorm:"not null" json:"currency"`
	Direction    string     `gorm:"not null" json:"direction"`
	Status       string     `gorm:"not null;default:pending" json:"status"`
	GatewayRef   string     `json:"gateway_ref"`
	Description  string     `json:"description"`
	CreatedAt    time.Time  `json:"created_at"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
