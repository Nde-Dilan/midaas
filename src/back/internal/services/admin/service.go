package admin

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	authsvc "github.com/MiltonJ23/Midaas/internal/services/auth"
	"github.com/google/uuid"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrAdminNotFound      = errors.New("admin not found")
)

type adminService struct {
	adminRepo   contracts.AdminRepository
	companyRepo contracts.CompanyRepository
	entrepRepo  contracts.EntrepreneurRepository
	userRepo    contracts.UserRepository
	hasher      *authsvc.PasswordHasher
	jwt         *authsvc.JWTService
}

func NewAdminService(
	adminRepo contracts.AdminRepository,
	companyRepo contracts.CompanyRepository,
	entrepRepo contracts.EntrepreneurRepository,
	userRepo contracts.UserRepository,
) contracts.AdminService {
	return &adminService{
		adminRepo:   adminRepo,
		companyRepo: companyRepo,
		entrepRepo:  entrepRepo,
		userRepo:    userRepo,
		hasher:      authsvc.NewPasswordHasher(),
		jwt:         authsvc.NewJWTService(),
	}
}

func (s *adminService) Register(ctx context.Context, input contracts.AdminRegisterInput) (*domain.Admin, error) {
	hashed, err := s.hasher.Hash(input.Password)
	if err != nil {
		return nil, fmt.Errorf("hash: %w", err)
	}

	admin := &domain.Admin{
		ID:           uuid.New(),
		Email:        input.Email,
		HashPassword: hashed,
		FullName:     input.FullName,
		Role:         input.Role,
	}

	if admin.Role == "" {
		admin.Role = domain.AdminRoleModerator
	}

	if err := s.adminRepo.Create(ctx, admin); err != nil {
		return nil, fmt.Errorf("create admin: %w", err)
	}

	logger.Info(ctx, "admin: registered", slog.String("admin_id", admin.ID.String()))
	return admin, nil
}

func (s *adminService) Login(ctx context.Context, email, password string) (*contracts.AdminAuthOutput, error) {
	admin, err := s.adminRepo.FindByEmail(ctx, email)
	if err != nil || admin == nil {
		s.hasher.DummyCompare()
		return nil, ErrInvalidCredentials
	}

	if err := s.hasher.Compare(admin.HashPassword, password); err != nil {
		s.hasher.DummyCompare()
		return nil, ErrInvalidCredentials
	}

	token, err := s.jwt.IssueForAdmin(admin.ID, admin.Email)
	if err != nil {
		return nil, fmt.Errorf("token: %w", err)
	}

	return &contracts.AdminAuthOutput{
		Admin: admin,
		Token: token,
	}, nil
}

func (s *adminService) ValidateCompany(ctx context.Context, companyID uuid.UUID, approved bool, reason string) error {
	company, err := s.companyRepo.FindByID(ctx, companyID)
	if err != nil {
		return fmt.Errorf("company not found: %w", err)
	}

	if approved {
		company.Status = domain.CompanyStatusApproved
	} else {
		company.Status = domain.CompanyStatusRejected
	}

	if err := s.companyRepo.Update(ctx, company); err != nil {
		return fmt.Errorf("update company: %w", err)
	}

	logger.Info(ctx, "admin: company reviewed",
		slog.String("company_id", companyID.String()),
		slog.Bool("approved", approved),
	)
	return nil
}

func (s *adminService) ValidateEntrepreneur(ctx context.Context, entrepreneurID uuid.UUID, approved bool, reason string) error {
	entrep, err := s.entrepRepo.FindByID(ctx, entrepreneurID)
	if err != nil {
		return fmt.Errorf("entrepreneur not found: %w", err)
	}

	if approved {
		entrep.Status = domain.EntrepreneurStatusActive
	} else {
		entrep.Status = domain.EntrepreneurStatusSuspended
	}

	if err := s.entrepRepo.Update(ctx, entrep); err != nil {
		return fmt.Errorf("update entrepreneur: %w", err)
	}

	logger.Info(ctx, "admin: entrepreneur reviewed",
		slog.String("entrepreneur_id", entrepreneurID.String()),
		slog.Bool("approved", approved),
	)
	return nil
}

func (s *adminService) ListPendingCompanies(ctx context.Context) ([]domain.Company, error) {
	return s.companyRepo.ListPending(ctx)
}

func (s *adminService) ListPendingEntrepreneurs(ctx context.Context) ([]domain.Entrepreneur, error) {
	return s.entrepRepo.ListPending(ctx)
}

func (s *adminService) ReviewMilestone(ctx context.Context, milestoneID uuid.UUID, approved bool, feedback string, reviewerID uuid.UUID) error {
	return fmt.Errorf("not implemented")
}

func (s *adminService) BlockProject(ctx context.Context, projectID uuid.UUID, reason string) error {
	return fmt.Errorf("not implemented")
}

func (s *adminService) ListPendingMilestones(ctx context.Context) ([]domain.Milestone, error) {
	return nil, fmt.Errorf("not implemented")
}
