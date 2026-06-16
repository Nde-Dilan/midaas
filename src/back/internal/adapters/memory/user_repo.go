package memory

import (
	"context"
	"errors"
	"sync"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

var (
	ErrNotFound = errors.New("record not found")
)

type UserRepository struct {
	mu    sync.RWMutex
	users map[string]*domain.User
}

func NewUserRepository() contracts.UserRepository {
	return &UserRepository{
		users: make(map[string]*domain.User),
	}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[user.ID.String()] = user
	return nil
}

func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	u, ok := r.users[id.String()]
	if !ok {
		return nil, ErrNotFound
	}
	return u, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, u := range r.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, ErrNotFound
}

func (r *UserRepository) Update(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[user.ID.String()] = user
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.users, id.String())
	return nil
}

func (r *UserRepository) ListAll(ctx context.Context) ([]domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.User
	for _, u := range r.users {
		list = append(list, *u)
	}
	return list, nil
}

type EntrepreneurRepository struct {
	mu           sync.RWMutex
	entrepreneurs map[string]*domain.Entrepreneur
}

func NewEntrepreneurRepository() contracts.EntrepreneurRepository {
	return &EntrepreneurRepository{
		entrepreneurs: make(map[string]*domain.Entrepreneur),
	}
}

func (r *EntrepreneurRepository) Create(ctx context.Context, e *domain.Entrepreneur) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.entrepreneurs[e.ID.String()] = e
	return nil
}

func (r *EntrepreneurRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Entrepreneur, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	e, ok := r.entrepreneurs[id.String()]
	if !ok {
		return nil, ErrNotFound
	}
	return e, nil
}

func (r *EntrepreneurRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*domain.Entrepreneur, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, e := range r.entrepreneurs {
		if e.UserID == userID {
			return e, nil
		}
	}
	return nil, ErrNotFound
}

func (r *EntrepreneurRepository) Update(ctx context.Context, e *domain.Entrepreneur) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.entrepreneurs[e.ID.String()] = e
	return nil
}

func (r *EntrepreneurRepository) ListPending(ctx context.Context) ([]domain.Entrepreneur, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var pending []domain.Entrepreneur
	for _, e := range r.entrepreneurs {
		if e.Status == domain.EntrepreneurStatusPending {
			pending = append(pending, *e)
		}
	}
	return pending, nil
}

func (r *EntrepreneurRepository) ListAll(ctx context.Context) ([]domain.Entrepreneur, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.Entrepreneur
	for _, e := range r.entrepreneurs {
		list = append(list, *e)
	}
	return list, nil
}
