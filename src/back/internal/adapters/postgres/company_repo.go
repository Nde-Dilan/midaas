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

func (r *companyRepository) ListApproved(ctx context.Context, filter contracts.CompanyFilter) ([]domain.Company, int64, error) {
	var list []domain.Company
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.Company{}).
		Where("status = ?", domain.CompanyStatusApproved)

	if filter.IndustrySector != "" {
		query = query.Where("industry_sector = ?", filter.IndustrySector)
	}
	if filter.CorporateForm != "" {
		query = query.Where("corporate_form = ?", filter.CorporateForm)
	}
	if filter.Query != "" {
		q := "%" + filter.Query + "%"
		query = query.Where("legal_name ILIKE ? OR trade_name ILIKE ?", q, q)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.PageSize <= 0 {
		filter.PageSize = 20
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	offset := (filter.Page - 1) * filter.PageSize

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(filter.PageSize).
		Find(&list).Error

	return list, total, err
}

func (r *companyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Company{}, "id = ?", id).Error
}
