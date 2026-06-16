package postgres

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type investmentRepository struct {
	db *gorm.DB
}

func NewInvestmentRepository(db *gorm.DB) contracts.InvestmentRepository {
	return &investmentRepository{db: db}
}

func (r *investmentRepository) Create(ctx context.Context, inv *domain.Investment) error {
	return r.db.WithContext(ctx).Create(inv).Error
}

func (r *investmentRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Investment, error) {
	var inv domain.Investment
	err := r.db.WithContext(ctx).
		Preload("Project").
		Preload("User").
		First(&inv, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *investmentRepository) ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Investment, error) {
	var list []domain.Investment
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Preload("Project").
		Order("created_at DESC").
		Find(&list).Error
	return list, err
}

func (r *investmentRepository) ListByProject(ctx context.Context, projectID uuid.UUID) ([]domain.Investment, error) {
	var list []domain.Investment
	err := r.db.WithContext(ctx).
		Where("project_id = ?", projectID).
		Preload("User").
		Order("created_at DESC").
		Find(&list).Error
	return list, err
}

func (r *investmentRepository) Update(ctx context.Context, inv *domain.Investment) error {
	return r.db.WithContext(ctx).Save(inv).Error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) contracts.TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, t *domain.Transaction) error {
	return r.db.WithContext(ctx).Create(t).Error
}

func (r *transactionRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Transaction, error) {
	var t domain.Transaction
	err := r.db.WithContext(ctx).First(&t, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *transactionRepository) ListByUser(ctx context.Context, userID uuid.UUID, page, pageSize int) ([]domain.Transaction, int64, error) {
	var list []domain.Transaction
	var total int64

	if pageSize <= 0 {
		pageSize = 20
	}
	if page <= 1 {
		page = 1
	}
	offset := (page - 1) * pageSize

	query := r.db.WithContext(ctx).Model(&domain.Transaction{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&list).Error

	return list, total, err
}

func (r *transactionRepository) ListAll(ctx context.Context, page, pageSize int) ([]domain.Transaction, int64, error) {
	var list []domain.Transaction
	var total int64

	if pageSize <= 0 {
		pageSize = 50
	}
	if page <= 1 {
		page = 1
	}
	offset := (page - 1) * pageSize

	query := r.db.WithContext(ctx).Model(&domain.Transaction{})

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&list).Error

	return list, total, err
}
