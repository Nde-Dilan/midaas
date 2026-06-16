package auth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	"github.com/google/uuid"
)

var (
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrEmailAlreadyExists  = errors.New("email already registered")
	ErrAlreadyEntrepreneur = errors.New("user is already an entrepreneur")
	ErrUserNotFound        = errors.New("user not found")
)

type authService struct {
	userRepo   contracts.UserRepository
	entrepRepo contracts.EntrepreneurRepository
	hasher     *PasswordHasher
	jwt        *JWTService
}

func NewAuthService(
	userRepo contracts.UserRepository,
	entrepRepo contracts.EntrepreneurRepository,
) contracts.AuthService {
	return &authService{
		userRepo:   userRepo,
		entrepRepo: entrepRepo,
		hasher:     NewPasswordHasher(),
		jwt:        NewJWTService(),
	}
}

func (s *authService) Register(ctx context.Context, input contracts.RegisterInput) (*domain.User, error) {
	logger.Debug(ctx, "auth: registering user", slog.String("email", input.Email))

	existing, err := s.userRepo.FindByEmail(ctx, input.Email)
	if err == nil && existing != nil {
		return nil, ErrEmailAlreadyExists
	}

	hashed, err := s.hasher.Hash(input.Password)
	if err != nil {
		logger.Error(ctx, "auth: failed to hash password", slog.String("error", err.Error()))
		return nil, fmt.Errorf("internal error")
	}

	user := &domain.User{
		ID:           uuid.New(),
		Email:        input.Email,
		PhoneNumber:  input.PhoneNumber,
		HashPassword: hashed,
		FullName:     input.FullName,
		IdCardUrl:    input.IdCardUrl,
		IdCardNumber: input.IdCardNumber,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		logger.Error(ctx, "auth: failed to create user", slog.String("error", err.Error()))
		return nil, fmt.Errorf("internal error")
	}

	logger.Info(ctx, "auth: user registered", slog.String("user_id", user.ID.String()))
	return user, nil
}

func (s *authService) Login(ctx context.Context, input contracts.LoginInput) (*contracts.AuthOutput, error) {
	logger.Debug(ctx, "auth: login attempt", slog.String("email", input.Email))

	user, err := s.userRepo.FindByEmail(ctx, input.Email)
	if err != nil || user == nil {
		s.hasher.DummyCompare()
		logger.Warn(ctx, "auth: login failed — user not found", slog.String("email", input.Email))
		return nil, ErrInvalidCredentials
	}

	if err := s.hasher.Compare(user.HashPassword, input.Password); err != nil {
		s.hasher.DummyCompare()
		logger.Warn(ctx, "auth: login failed — wrong password", slog.String("user_id", user.ID.String()))
		return nil, ErrInvalidCredentials
	}

	token, err := s.jwt.Issue(user.ID, user.Email)
	if err != nil {
		logger.Error(ctx, "auth: failed to generate token", slog.String("error", err.Error()))
		return nil, fmt.Errorf("internal error")
	}

	logger.Info(ctx, "auth: user logged in", slog.String("user_id", user.ID.String()))
	return &contracts.AuthOutput{
		User:  user,
		Token: token,
	}, nil
}

func (s *authService) GetProfile(ctx context.Context, userID uuid.UUID) (*contracts.UserProfile, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	profile := &contracts.UserProfile{
		User:          user,
		IsEntrepreneur: false,
	}

	entrepreneur, err := s.entrepRepo.FindByUserID(ctx, userID)
	if err == nil && entrepreneur != nil {
		profile.IsEntrepreneur = true
		profile.Entrepreneur = entrepreneur
	}

	return profile, nil
}

func (s *authService) BecomeEntrepreneur(ctx context.Context, userID uuid.UUID) (*domain.Entrepreneur, error) {
	logger.Debug(ctx, "auth: become entrepreneur request", slog.String("user_id", userID.String()))

	existing, err := s.entrepRepo.FindByUserID(ctx, userID)
	if err == nil && existing != nil {
		return nil, ErrAlreadyEntrepreneur
	}

	entrepreneur := &domain.Entrepreneur{
		ID:     uuid.New(),
		UserID: userID,
		Status: domain.EntrepreneurStatusActive,
	}

	if err := s.entrepRepo.Create(ctx, entrepreneur); err != nil {
		logger.Error(ctx, "auth: failed to create entrepreneur", slog.String("error", err.Error()))
		return nil, fmt.Errorf("internal error")
	}

	logger.Info(ctx, "auth: entrepreneur activated", slog.String("entrepreneur_id", entrepreneur.ID.String()))
	return entrepreneur, nil
}
