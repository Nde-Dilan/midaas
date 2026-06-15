package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type AdminRegisterInput struct {
	Email    string
	Password string
	FullName string
	Role     string
}

type AdminAuthOutput struct {
	Admin *domain.Admin
	Token string
}

type AdminService interface {
	Register(ctx context.Context, input AdminRegisterInput) (*domain.Admin, error)
	Login(ctx context.Context, email, password string) (*AdminAuthOutput, error)

	ValidateEntrepreneur(ctx context.Context, entrepreneurID uuid.UUID, approved bool, reason string) error
	ValidateCompany(ctx context.Context, companyID uuid.UUID, approved bool, reason string) error
	ReviewMilestone(ctx context.Context, milestoneID uuid.UUID, approved bool, feedback string, reviewerID uuid.UUID) error
	BlockProject(ctx context.Context, projectID uuid.UUID, reason string) error

	ListPendingEntrepreneurs(ctx context.Context) ([]domain.Entrepreneur, error)
	ListPendingCompanies(ctx context.Context) ([]domain.Company, error)
	ListPendingMilestones(ctx context.Context) ([]domain.Milestone, error)
}
