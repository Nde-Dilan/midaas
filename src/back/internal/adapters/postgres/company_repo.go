package postgres

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type companyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) contracts.CompanyRepository {
	return &companyRepository{db: db}
}

func (r *companyRepository) Create(ctx context.Context, c *domain.Company) error {
	return r.db.WithContext(ctx).Create(c).Error
}

func (r *companyRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Company, error) {
	var c domain.Company
	err := r.db.WithContext(ctx).First(&c, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *companyRepository) FindByIDWithRelations(ctx context.Context, id uuid.UUID) (*domain.Company, error) {
	var c domain.Company
	err := r.db.WithContext(ctx).
		Preload("LegalDocs").
		Preload("Financials").
		Preload("BeneficialOwners").
		Preload("Managers").
		Preload("Operations").
		Preload("Entrepreneur").
		First(&c, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *companyRepository) ListByEntrepreneur(ctx context.Context, eID uuid.UUID) ([]domain.Company, error) {
	var list []domain.Company
	err := r.db.WithContext(ctx).Where("entrepreneur_id = ?", eID).Find(&list).Error
	return list, err
}

func (r *companyRepository) ListPending(ctx context.Context) ([]domain.Company, error) {
	var list []domain.Company
	err := r.db.WithContext(ctx).Where("status = ?", domain.CompanyStatusPending).Find(&list).Error
	return list, err
}

func (r *companyRepository) Update(ctx context.Context, c *domain.Company) error {
	return r.db.WithContext(ctx).Save(c).Error
}

func (r *companyRepository) ListApproved(ctx context.Context) ([]domain.Company, error) {
	var list []domain.Company
	err := r.db.WithContext(ctx).
		Where("status = ?", domain.CompanyStatusApproved).
		Order("created_at DESC").
		Find(&list).Error
	return list, err
}

func (r *companyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Company{}, "id = ?", id).Error
}
