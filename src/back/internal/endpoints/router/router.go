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
	adminHandler *handler.AdminHandler,
	projectHandler *handler.ProjectHandler,
	investmentHandler *handler.InvestmentHandler,
	entrepRepo contracts.EntrepreneurRepository,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.Handle("POST /api/v1/auth/entrepreneur", middleware.AuthRequired(http.HandlerFunc(authHandler.BecomeEntrepreneur)))
	mux.Handle("GET /api/v1/auth/me", middleware.AuthRequired(http.HandlerFunc(authHandler.Me)))
	mux.Handle("POST /api/v1/upload/id-card", middleware.AuthRequired(http.HandlerFunc(uploadHandler.UploadIDCard)))
	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	entrepOnly := middleware.EntrepreneurRequired(entrepRepo)

	mux.Handle("POST /api/v1/companies", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.Create))))
	mux.Handle("GET /api/v1/companies", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.ListMyCompanies))))
	mux.Handle("GET /api/v1/companies/{id}", middleware.AuthRequired(http.HandlerFunc(companyHandler.GetByID)))
	mux.Handle("POST /api/v1/companies/{id}/submit", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.Submit))))
	mux.Handle("POST /api/v1/companies/{id}/upload", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.UploadDocument))))
	mux.Handle("PUT /api/v1/companies/{id}/legal-docs", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.SaveLegalDocs))))
	mux.Handle("PUT /api/v1/companies/{id}/financials", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.SaveFinancials))))
	mux.Handle("PUT /api/v1/companies/{id}/operations", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.SaveOperations))))
	mux.Handle("POST /api/v1/companies/{id}/beneficial-owners", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.AddBeneficialOwner))))
	mux.Handle("DELETE /api/v1/companies/{id}/beneficial-owners/{ownerId}", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.RemoveBeneficialOwner))))
	mux.Handle("POST /api/v1/companies/{id}/managers", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.AddManager))))
	mux.Handle("DELETE /api/v1/companies/{id}/managers/{managerId}", middleware.AuthRequired(entrepOnly(http.HandlerFunc(companyHandler.RemoveManager))))
	mux.HandleFunc("GET /api/v1/companies/public", companyHandler.ListPublic)
	mux.Handle("POST /api/v1/companies/{id}/reverify", middleware.AuthRequired(http.HandlerFunc(companyHandler.RequestReverify)))

	mux.HandleFunc("GET /api/v1/projects/discover", projectHandler.Discover)

	mux.Handle("POST /api/v1/projects", middleware.AuthRequired(entrepOnly(http.HandlerFunc(projectHandler.Create))))
	mux.HandleFunc("GET /api/v1/projects/public", projectHandler.ListPublic)
	mux.Handle("GET /api/v1/projects/{id}", middleware.AuthRequired(http.HandlerFunc(projectHandler.GetByID)))
	mux.Handle("GET /api/v1/projects/my", middleware.AuthRequired(entrepOnly(http.HandlerFunc(projectHandler.ListMyProjects))))
	mux.Handle("POST /api/v1/projects/{id}/submit", middleware.AuthRequired(entrepOnly(http.HandlerFunc(projectHandler.Submit))))
	mux.Handle("POST /api/v1/projects/{id}/accept", middleware.AuthRequired(entrepOnly(http.HandlerFunc(projectHandler.Accept))))
	mux.Handle("POST /api/v1/projects/{id}/cancel", middleware.AuthRequired(entrepOnly(http.HandlerFunc(projectHandler.Cancel))))
	mux.Handle("POST /api/v1/milestones/{id}/upload", middleware.AuthRequired(entrepOnly(http.HandlerFunc(projectHandler.UploadMilestoneProof))))

	mux.Handle("POST /api/v1/projects/{id}/invest", middleware.AuthRequired(http.HandlerFunc(investmentHandler.Invest)))
	mux.Handle("GET /api/v1/projects/{id}/investors", middleware.AuthRequired(http.HandlerFunc(investmentHandler.ListProjectInvestors)))
	mux.Handle("GET /api/v1/investments/my", middleware.AuthRequired(http.HandlerFunc(investmentHandler.ListMyInvestments)))

	mux.HandleFunc("POST /api/v1/admin/login", adminHandler.Login)
	mux.Handle("GET /api/v1/admin/me", middleware.AdminRequired(http.HandlerFunc(adminHandler.Me)))
	mux.Handle("GET /api/v1/admin/companies/pending", middleware.AdminRequired(http.HandlerFunc(adminHandler.ListPendingCompanies)))
	mux.Handle("POST /api/v1/admin/companies/{id}/approve", middleware.AdminRequired(http.HandlerFunc(adminHandler.ApproveCompany)))
	mux.Handle("POST /api/v1/admin/companies/{id}/reject", middleware.AdminRequired(http.HandlerFunc(adminHandler.RejectCompany)))
	mux.Handle("GET /api/v1/admin/entrepreneurs", middleware.AdminRequired(http.HandlerFunc(adminHandler.ListEntrepreneurs)))
	mux.Handle("POST /api/v1/admin/entrepreneurs/{id}/suspend", middleware.AdminRequired(http.HandlerFunc(adminHandler.SuspendEntrepreneur)))
	mux.Handle("POST /api/v1/admin/entrepreneurs/{id}/activate", middleware.AdminRequired(http.HandlerFunc(adminHandler.ActivateEntrepreneur)))
	mux.Handle("GET /api/v1/admin/users", middleware.AdminRequired(http.HandlerFunc(adminHandler.ListUsers)))
	mux.Handle("GET /api/v1/admin/projects/pending", middleware.AdminRequired(http.HandlerFunc(adminHandler.ListPendingProjects)))
	mux.Handle("POST /api/v1/admin/projects/{id}/approve", middleware.AdminRequired(http.HandlerFunc(adminHandler.ApproveProject)))
	mux.Handle("POST /api/v1/admin/projects/{id}/reject", middleware.AdminRequired(http.HandlerFunc(adminHandler.RejectProject)))
	mux.Handle("GET /api/v1/admin/milestones/pending", middleware.AdminRequired(http.HandlerFunc(adminHandler.ListPendingMilestones)))
	mux.Handle("POST /api/v1/admin/milestones/{id}/approve", middleware.AdminRequired(http.HandlerFunc(adminHandler.ApproveMilestone)))
	mux.Handle("POST /api/v1/admin/milestones/{id}/reject", middleware.AdminRequired(http.HandlerFunc(adminHandler.RejectMilestone)))

	var h http.Handler = mux
	h = middleware.CORS(h)
	h = middleware.RequestID(h)
	h = middleware.RequestLogger(log)(h)

	return h
}
