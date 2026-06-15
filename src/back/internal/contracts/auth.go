package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type RegisterInput struct {
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password"`
	FullName    string `json:"full_name"`
	IdCardUrl   string `json:"id_card_url,omitempty"`
	IdCardNumber string `json:"id_card_number,omitempty"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthOutput struct {
	User  *domain.User
	Token string
}

type UserProfile struct {
	User         *domain.User         `json:"user"`
	IsEntrepreneur bool                `json:"is_entrepreneur"`
	Entrepreneur *domain.Entrepreneur `json:"entrepreneur,omitempty"`
}

type AuthService interface {
	Register(ctx context.Context, input RegisterInput) (*domain.User, error)
	Login(ctx context.Context, input LoginInput) (*AuthOutput, error)
	GetProfile(ctx context.Context, userID uuid.UUID) (*UserProfile, error)
	BecomeEntrepreneur(ctx context.Context, userID uuid.UUID) (*domain.Entrepreneur, error)
}
