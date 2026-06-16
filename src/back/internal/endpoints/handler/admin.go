package handler

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	adminsvc "github.com/MiltonJ23/Midaas/internal/services/admin"
	"github.com/google/uuid"
)

type adminCtxKey string

const AdminIDKey adminCtxKey = "admin_id"

type AdminHandler struct {
	adminService contracts.AdminService
	adminRepo    contracts.AdminRepository
	userRepo     contracts.UserRepository
	entrepRepo   contracts.EntrepreneurRepository
}

func NewAdminHandler(
	adminService contracts.AdminService,
	adminRepo contracts.AdminRepository,
	userRepo contracts.UserRepository,
	entrepRepo contracts.EntrepreneurRepository,
) *AdminHandler {
	return &AdminHandler{
		adminService: adminService,
		adminRepo:    adminRepo,
		userRepo:     userRepo,
		entrepRepo:   entrepRepo,
	}
}

func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if input.Email == "" || input.Password == "" {
		JSONError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	output, err := h.adminService.Login(ctx, input.Email, input.Password)
	if err != nil {
		if errors.Is(err, adminsvc.ErrInvalidCredentials) {
			JSONError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		JSONError(w, http.StatusInternalServerError, "authentication failed")
		return
	}

	JSON(w, http.StatusOK, map[string]interface{}{
		"admin": output.Admin,
		"token": output.Token,
	})
}

func (h *AdminHandler) Me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	adminID, err := adminIDFromContext(ctx)
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "admin authentication required")
		return
	}

	admin, err := h.adminRepo.FindByID(ctx, adminID)
	if err != nil {
		JSONError(w, http.StatusNotFound, "admin not found")
		return
	}

	JSON(w, http.StatusOK, admin)
}

func (h *AdminHandler) ListPendingCompanies(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	companies, err := h.adminService.ListPendingCompanies(ctx)
	if err != nil {
		logger.Error(ctx, "handler: list pending companies failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to list companies")
		return
	}

	JSON(w, http.StatusOK, companies)
}

func (h *AdminHandler) ApproveCompany(w http.ResponseWriter, r *http.Request) {
	h.reviewCompany(w, r, true)
}

func (h *AdminHandler) RejectCompany(w http.ResponseWriter, r *http.Request) {
	h.reviewCompany(w, r, false)
}

func (h *AdminHandler) reviewCompany(w http.ResponseWriter, r *http.Request, approved bool) {
	ctx := r.Context()

	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company id")
		return
	}

	var reason string
	if !approved {
		var body struct {
			Reason string `json:"reason"`
		}
		Decode(r, &body)
		reason = body.Reason
	}

	if err := h.adminService.ValidateCompany(ctx, id, approved, reason); err != nil {
		logger.Error(ctx, "handler: review company failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to review company")
		return
	}

	status := domain.CompanyStatusApproved
	if !approved {
		status = domain.CompanyStatusRejected
	}

	JSON(w, http.StatusOK, map[string]string{
		"company_id": id.String(),
		"status":     status,
	})
}

func (h *AdminHandler) ListEntrepreneurs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	entrep, err := h.entrepRepo.ListAll(ctx)
	if err != nil {
		logger.Error(ctx, "handler: list entrepreneurs failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to list entrepreneurs")
		return
	}

	JSON(w, http.StatusOK, entrep)
}

func (h *AdminHandler) SuspendEntrepreneur(w http.ResponseWriter, r *http.Request) {
	h.reviewEntrepreneur(w, r, false)
}

func (h *AdminHandler) ActivateEntrepreneur(w http.ResponseWriter, r *http.Request) {
	h.reviewEntrepreneur(w, r, true)
}

func (h *AdminHandler) reviewEntrepreneur(w http.ResponseWriter, r *http.Request, approved bool) {
	ctx := r.Context()

	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid entrepreneur id")
		return
	}

	if err := h.adminService.ValidateEntrepreneur(ctx, id, approved, ""); err != nil {
		logger.Error(ctx, "handler: review entrepreneur failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to update entrepreneur")
		return
	}

	status := domain.EntrepreneurStatusActive
	if !approved {
		status = domain.EntrepreneurStatusSuspended
	}

	JSON(w, http.StatusOK, map[string]string{
		"entrepreneur_id": id.String(),
		"status":          status,
	})
}

func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	users, err := h.userRepo.ListAll(ctx)
	if err != nil {
		logger.Error(ctx, "handler: list users failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to list users")
		return
	}

	JSON(w, http.StatusOK, users)
}

func adminIDFromContext(ctx context.Context) (uuid.UUID, error) {
	idStr, ok := ctx.Value(AdminIDKey).(string)
	if !ok {
		return uuid.Nil, errors.New("admin id not in context")
	}
	return uuid.Parse(idStr)
}
