package handler

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/logger"
	authsvc "github.com/MiltonJ23/Midaas/internal/services/auth"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService contracts.AuthService
	notifSvc    contracts.NotificationService
}

func NewAuthHandler(authService contracts.AuthService, notifSvc contracts.NotificationService) *AuthHandler {
	return &AuthHandler{authService: authService, notifSvc: notifSvc}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var input contracts.RegisterInput
	if err := Decode(r, &input); err != nil {
		logger.Warn(ctx, "handler: invalid register body", slog.String("error", err.Error()))
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if input.Email == "" || input.Password == "" || input.FullName == "" {
		JSONError(w, http.StatusBadRequest, "email, password, and full_name are required")
		return
	}

	if len(input.Password) < 8 {
		JSONError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	user, err := h.authService.Register(ctx, input)
	if err != nil {
		switch {
		case errors.Is(err, authsvc.ErrEmailAlreadyExists):
			JSONError(w, http.StatusConflict, "email already registered")
		default:
			logger.Error(ctx, "handler: register failed", slog.String("error", err.Error()))
			JSONError(w, http.StatusInternalServerError, "registration failed")
		}
		return
	}

	logger.Info(ctx, "handler: user registered",
		slog.String("user_id", user.ID.String()),
		slog.String("email", user.Email),
	)

	if h.notifSvc != nil {
		email := user.Email
		name := user.FullName
		go func() {
			if err := h.notifSvc.SendRegistrationConfirmation(context.Background(), email, name); err != nil {
				logger.Error(context.Background(), "handler: failed to send welcome email",
					slog.String("email", email),
					slog.String("error", err.Error()),
				)
			}
		}()
	}

	JSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var input contracts.LoginInput
	if err := Decode(r, &input); err != nil {
		logger.Warn(ctx, "handler: invalid login body", slog.String("error", err.Error()))
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if input.Email == "" || input.Password == "" {
		JSONError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	output, err := h.authService.Login(ctx, input)
	if err != nil {
		if errors.Is(err, authsvc.ErrInvalidCredentials) {
			logger.Warn(ctx, "handler: login denied", slog.String("email", input.Email))
			JSONError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		logger.Error(ctx, "handler: login failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "authentication failed")
		return
	}

	logger.Info(ctx, "handler: user logged in",
		slog.String("user_id", output.User.ID.String()),
	)
	JSON(w, http.StatusOK, map[string]interface{}{
		"user":  output.User,
		"token": output.Token,
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, err := userIDFromContext(ctx)
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	profile, err := h.authService.GetProfile(ctx, userID)
	if err != nil {
		if errors.Is(err, authsvc.ErrUserNotFound) {
			JSONError(w, http.StatusNotFound, "user not found")
			return
		}
		logger.Error(ctx, "handler: get profile failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to get profile")
		return
	}

	JSON(w, http.StatusOK, profile)
}

func (h *AuthHandler) BecomeEntrepreneur(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, err := userIDFromContext(ctx)
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	entrepreneur, err := h.authService.BecomeEntrepreneur(ctx, userID)
	if err != nil {
		if errors.Is(err, authsvc.ErrAlreadyEntrepreneur) {
			JSONError(w, http.StatusConflict, "already registered as entrepreneur")
			return
		}
		logger.Error(ctx, "handler: become entrepreneur failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to create entrepreneur profile")
		return
	}

	logger.Info(ctx, "handler: entrepreneur application created",
		slog.String("entrepreneur_id", entrepreneur.ID.String()),
		slog.String("user_id", userID.String()),
	)
	JSON(w, http.StatusCreated, entrepreneur)
}

func userIDFromContext(ctx context.Context) (uuid.UUID, error) {
	idStr, ok := ctx.Value(UserIDKey).(string)
	if !ok {
		return uuid.Nil, errors.New("user id not in context")
	}
	return uuid.Parse(idStr)
}
