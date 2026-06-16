package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type CreateProjectInput struct {
	CompanyID      uuid.UUID
	EntrepreneurID uuid.UUID
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	FundingGoal    float64 `json:"funding_goal"`
	Currency       string  `json:"currency"`
	Category       string  `json:"category"`
	CoverImageUrl  string  `json:"cover_image_url"`
	StartDate      string  `json:"start_date"`
	EndDate        string  `json:"end_date"`
}

type ProjectFilter struct {
	Category string
	Status   string
	Currency string
	MinGoal  float64
	MaxGoal  float64
	Query    string
	Page     int
	PageSize int
}

type ProjectService interface {
	Create(ctx context.Context, input CreateProjectInput) (*domain.Project, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Project, error)
	List(ctx context.Context, filter ProjectFilter) ([]domain.Project, int64, error)
	ListByEntrepreneur(ctx context.Context, entrepreneurID uuid.UUID) ([]domain.Project, error)
	ListByCompany(ctx context.Context, companyID uuid.UUID) ([]domain.Project, error)
	Update(ctx context.Context, id uuid.UUID, input CreateProjectInput) (*domain.Project, error)
	Block(ctx context.Context, id uuid.UUID, reason string) error
	Reject(ctx context.Context, id uuid.UUID, reason string) error
}
