package domain

import "github.com/google/uuid"

type Portfolio struct {
	UserID       uuid.UUID         `json:"user_id"`
	TotalValue   float64           `json:"total_value"`
	TotalInvested float64          `json:"total_invested"`
	Investments  []InvestmentDetail `json:"investments"`
}

type InvestmentDetail struct {
	InvestmentID     uuid.UUID `json:"investment_id"`
	ProjectID        uuid.UUID `json:"project_id"`
	ProjectTitle     string    `json:"project_title"`
	CompanyName      string    `json:"company_name"`
	EntrepreneurName string    `json:"entrepreneur_name"`
	Amount           float64   `json:"amount"`
	Currency         string    `json:"currency"`
	OwnershipPct     float64   `json:"ownership_pct"`
	ProjectStatus    string    `json:"project_status"`
	MilestoneStatus  string    `json:"milestone_status"`
	CurrentMilestone int       `json:"current_milestone"`
	TotalMilestones  int       `json:"total_milestones"`
	InvestedAt       string    `json:"invested_at"`
}
