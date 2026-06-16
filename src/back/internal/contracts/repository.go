package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type EntrepreneurRepository interface {
	Create(ctx context.Context, entrepreneur *domain.Entrepreneur) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Entrepreneur, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) (*domain.Entrepreneur, error)
	Update(ctx context.Context, entrepreneur *domain.Entrepreneur) error
	ListPending(ctx context.Context) ([]domain.Entrepreneur, error)
}

type CompanyRepository interface {
	Create(ctx context.Context, company *domain.Company) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Company, error)
	FindByIDWithRelations(ctx context.Context, id uuid.UUID) (*domain.Company, error)
	ListByEntrepreneur(ctx context.Context, entrepreneurID uuid.UUID) ([]domain.Company, error)
	ListPending(ctx context.Context) ([]domain.Company, error)
	ListApproved(ctx context.Context, filter CompanyFilter) ([]domain.Company, int64, error)
	Update(ctx context.Context, company *domain.Company) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type ProjectRepository interface {
	Create(ctx context.Context, project *domain.Project) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Project, error)
	FindByIDWithRelations(ctx context.Context, id uuid.UUID) (*domain.Project, error)
	List(ctx context.Context, filter ProjectFilter) ([]domain.Project, int64, error)
	ListByEntrepreneur(ctx context.Context, entrepreneurID uuid.UUID) ([]domain.Project, error)
	ListByCompany(ctx context.Context, companyID uuid.UUID) ([]domain.Project, error)
	Update(ctx context.Context, project *domain.Project) error
}

type MilestoneRepository interface {
	Create(ctx context.Context, milestone *domain.Milestone) error
	CreateBatch(ctx context.Context, milestones []domain.Milestone) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Milestone, error)
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]domain.Milestone, error)
	ListPending(ctx context.Context) ([]domain.Milestone, error)
	Update(ctx context.Context, milestone *domain.Milestone) error
	FindNextPending(ctx context.Context, projectID uuid.UUID) (*domain.Milestone, error)
}

type InvestmentRepository interface {
	Create(ctx context.Context, investment *domain.Investment) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Investment, error)
	ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Investment, error)
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]domain.Investment, error)
	Update(ctx context.Context, investment *domain.Investment) error
}

type TransactionRepository interface {
	Create(ctx context.Context, transaction *domain.Transaction) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Transaction, error)
	ListByUser(ctx context.Context, userID uuid.UUID, page, pageSize int) ([]domain.Transaction, int64, error)
}

type AdminRepository interface {
	Create(ctx context.Context, admin *domain.Admin) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Admin, error)
	FindByEmail(ctx context.Context, email string) (*domain.Admin, error)
	Update(ctx context.Context, admin *domain.Admin) error
}
