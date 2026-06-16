package postgres

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) contracts.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.User{}, "id = ?", id).Error
}

func (r *userRepository) ListAll(ctx context.Context) ([]domain.User, error) {
	var list []domain.User
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&list).Error
	return list, err
}

type entrepreneurRepository struct {
	db *gorm.DB
}

func NewEntrepreneurRepository(db *gorm.DB) contracts.EntrepreneurRepository {
	return &entrepreneurRepository{db: db}
}

func (r *entrepreneurRepository) Create(ctx context.Context, e *domain.Entrepreneur) error {
	return r.db.WithContext(ctx).Create(e).Error
}

func (r *entrepreneurRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Entrepreneur, error) {
	var e domain.Entrepreneur
	err := r.db.WithContext(ctx).First(&e, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *entrepreneurRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*domain.Entrepreneur, error) {
	var e domain.Entrepreneur
	err := r.db.WithContext(ctx).First(&e, "user_id = ?", userID).Error
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *entrepreneurRepository) Update(ctx context.Context, e *domain.Entrepreneur) error {
	return r.db.WithContext(ctx).Save(e).Error
}

func (r *entrepreneurRepository) ListPending(ctx context.Context) ([]domain.Entrepreneur, error) {
	var list []domain.Entrepreneur
	err := r.db.WithContext(ctx).Where("status = ?", domain.EntrepreneurStatusPending).Find(&list).Error
	return list, err
}

func (r *entrepreneurRepository) ListAll(ctx context.Context) ([]domain.Entrepreneur, error) {
	var list []domain.Entrepreneur
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&list).Error
	return list, err
}

type adminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) contracts.AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) Create(ctx context.Context, admin *domain.Admin) error {
	return r.db.WithContext(ctx).Create(admin).Error
}

func (r *adminRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Admin, error) {
	var admin domain.Admin
	err := r.db.WithContext(ctx).First(&admin, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) FindByEmail(ctx context.Context, email string) (*domain.Admin, error) {
	var admin domain.Admin
	err := r.db.WithContext(ctx).First(&admin, "email = ?", email).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *adminRepository) Update(ctx context.Context, admin *domain.Admin) error {
	return r.db.WithContext(ctx).Save(admin).Error
}
