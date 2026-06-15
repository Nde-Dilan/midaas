package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type CreateInvestmentInput struct {
	ProjectID uuid.UUID
	UserID    uuid.UUID
	Amount    float64
	Currency  string
}

type InvestmentDetailOutput struct {
	Investment  domain.Investment
	Project     domain.Project
	Company     domain.Company
	Entrepreneur domain.Entrepreneur
}

type InvestmentService interface {
	Create(ctx context.Context, input CreateInvestmentInput) (*domain.Investment, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Investment, error)
	ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Investment, error)
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]domain.Investment, error)
	GetProjectInvestors(ctx context.Context, projectID uuid.UUID, detailLevel string) ([]InvestmentDetailOutput, error)
}
