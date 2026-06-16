package router

import (
	"log/slog"
	"net/http"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/endpoints/handler"
	"github.com/MiltonJ23/Midaas/internal/endpoints/middleware"
)

func New(
	log *slog.Logger,
	authHandler *handler.AuthHandler,
	uploadHandler *handler.UploadHandler,
	companyHandler *handler.CompanyHandler,
	entrepRepo contracts.EntrepreneurRepository,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)

	mux.Handle("POST /api/v1/auth/entrepreneur", middleware.AuthRequired(
		http.HandlerFunc(authHandler.BecomeEntrepreneur),
	))
	mux.Handle("GET /api/v1/auth/me", middleware.AuthRequired(
		http.HandlerFunc(authHandler.Me),
	))

	mux.Handle("POST /api/v1/upload/id-card", middleware.AuthRequired(
		http.HandlerFunc(uploadHandler.UploadIDCard),
	))

	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	entrepOnly := middleware.EntrepreneurRequired(entrepRepo)

	mux.Handle("POST /api/v1/companies", middleware.AuthRequired(entrepOnly(
		http.HandlerFunc(companyHandler.Create),
	)))
	mux.Handle("GET /api/v1/companies", middleware.AuthRequired(entrepOnly(
		http.HandlerFunc(companyHandler.ListMyCompanies),
	)))
	mux.Handle("GET /api/v1/companies/{id}", middleware.AuthRequired(
		http.HandlerFunc(companyHandler.GetByID),
	))
	mux.Handle("POST /api/v1/companies/{id}/submit", middleware.AuthRequired(entrepOnly(
		http.HandlerFunc(companyHandler.Submit),
	)))
	mux.Handle("POST /api/v1/companies/{id}/upload", middleware.AuthRequired(entrepOnly(
		http.HandlerFunc(companyHandler.UploadDocument),
	)))

	mux.HandleFunc("GET /api/v1/companies/public", companyHandler.ListPublic)

	mux.Handle("POST /api/v1/companies/{id}/reverify", middleware.AuthRequired(
		http.HandlerFunc(companyHandler.RequestReverify),
	))

	var h http.Handler = mux
	h = middleware.CORS(h)
	h = middleware.RequestID(h)
	h = middleware.RequestLogger(log)(h)

	return h
}
