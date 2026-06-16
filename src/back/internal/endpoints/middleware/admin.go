package middleware

import (
	"context"
	"net/http"

	"github.com/MiltonJ23/Midaas/internal/endpoints/handler"
	authsvc "github.com/MiltonJ23/Midaas/internal/services/auth"
)

var adminJWT *authsvc.JWTService

func init() {
	adminJWT = authsvc.NewJWTService()
}

func AdminRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := extractToken(r)
		if token == "" {
			handler.JSONError(w, http.StatusUnauthorized, "authentication required")
			return
		}

		adminID, err := adminJWT.ValidateAdmin(token)
		if err != nil {
			handler.JSONError(w, http.StatusForbidden, "admin access required")
			return
		}

		ctx := context.WithValue(r.Context(), handler.AdminIDKey, adminID.String())
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
