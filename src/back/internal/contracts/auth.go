package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type RegisterInput struct {
	Email       string
	PhoneNumber string
	Password    string
	FullName    string
	IdCardUrl   string
	IdCardNumber string
}

type LoginInput struct {
	Email    string
	Password string
}

type AuthOutput struct {
	User  *domain.User
	Token string
}

type AuthService interface {
	Register(ctx context.Context, input RegisterInput) (*domain.User, error)
	Login(ctx context.Context, input LoginInput) (*AuthOutput, error)
	BecomeEntrepreneur(ctx context.Context, userID uuid.UUID) (*domain.Entrepreneur, error)
}
