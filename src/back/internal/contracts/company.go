package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type CreateCompanyInput struct {
	EntrepreneurID  uuid.UUID
	LegalName       string
	TradeName       string
	CorporateForm   string
	IndustrySector  string
	GpsCoordinates  string
	PhysicalAddress string
}

type CompanyFilter struct {
	IndustrySector string
	CorporateForm  string
	Query          string
	Page           int
	PageSize       int
}

type CompanyService interface {
	Create(ctx context.Context, input CreateCompanyInput) (*domain.Company, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Company, error)
	ListByEntrepreneur(ctx context.Context, entrepreneurID uuid.UUID) ([]domain.Company, error)
	Update(ctx context.Context, id uuid.UUID, input CreateCompanyInput) (*domain.Company, error)
	Approve(ctx context.Context, id uuid.UUID) error
	Reject(ctx context.Context, id uuid.UUID, reason string) error
}
