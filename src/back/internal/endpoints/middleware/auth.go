package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"strings"

	"github.com/MiltonJ23/Midaas/internal/endpoints/handler"
	"github.com/MiltonJ23/Midaas/internal/logger"
	authsvc "github.com/MiltonJ23/Midaas/internal/services/auth"
)

func AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := extractToken(r)
		if token == "" {
			handler.JSONError(w, http.StatusUnauthorized, "authentication required")
			return
		}

		userID, err := validateToken(token)
		if err != nil {
			logger.Warn(r.Context(), "middleware: invalid token",
				slog.String("error", err.Error()),
			)
			handler.JSONError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), handler.UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func validateToken(token string) (string, error) {
	validator := authsvc.NewSupabaseJWTValidator()
	if validator != nil {
		userID, _, err := validator.Validate(token)
		if err == nil {
			return userID.String(), nil
		}
	}

	return parseSimpleToken(token)
}

func extractToken(r *http.Request) string {
	if auth := r.Header.Get("Authorization"); auth != "" {
		if strings.HasPrefix(auth, "Bearer ") {
			return strings.TrimPrefix(auth, "Bearer ")
		}
		return auth
	}
	return r.URL.Query().Get("token")
}

func parseSimpleToken(token string) (string, error) {
	idx := strings.LastIndex(token, ".")
	if idx == -1 {
		return "", http.ErrNoCookie
	}
	return token[idx+1:], nil
}
