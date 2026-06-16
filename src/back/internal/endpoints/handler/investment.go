package handler

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	"github.com/google/uuid"
)

type InvestmentHandler struct {
	investmentRepo contracts.InvestmentRepository
	projectRepo    contracts.ProjectRepository
	userRepo       contracts.UserRepository
	notifSvc       contracts.NotificationService
}

func NewInvestmentHandler(
	investmentRepo contracts.InvestmentRepository,
	projectRepo contracts.ProjectRepository,
	userRepo contracts.UserRepository,
	notifSvc contracts.NotificationService,
) *InvestmentHandler {
	return &InvestmentHandler{
		investmentRepo: investmentRepo,
		projectRepo:    projectRepo,
		userRepo:       userRepo,
		notifSvc:       notifSvc,
	}
}

func (h *InvestmentHandler) Invest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, err := uuid.Parse(userIDFromContext_str(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	projectID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}

	var input struct {
		Amount   float64 `json:"amount"`
		Currency string  `json:"currency"`
	}
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.Amount <= 0 {
		JSONError(w, http.StatusBadRequest, "amount must be positive")
		return
	}
	if input.Currency == "" {
		input.Currency = "XOF"
	}

	project, err := h.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		JSONError(w, http.StatusNotFound, "project not found")
		return
	}
	if project.Status != domain.ProjectStatusActive {
		JSONError(w, http.StatusBadRequest, "project is not open for investment")
		return
	}

	ownershipPct := (input.Amount / project.FundingGoal) * 100

	investment := &domain.Investment{
		ID:           uuid.New(),
		ProjectID:    projectID,
		UserID:       userID,
		Amount:       input.Amount,
		Currency:     input.Currency,
		OwnershipPct: ownershipPct,
		Status:       domain.InvestmentStatusConfirmed,
	}
	if err := h.investmentRepo.Create(ctx, investment); err != nil {
		logger.Error(ctx, "handler: create investment failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to record investment")
		return
	}

	project.FundingRaised += input.Amount
	if project.FundingRaised >= project.FundingGoal {
		project.Status = domain.ProjectStatusFunded
		deadline := time.Now().Add(48 * time.Hour)
		project.AcceptanceDeadline = &deadline
	}
	h.projectRepo.Update(ctx, project)

	if h.notifSvc != nil {
		go h.notifSvc.SendInvestmentConfirmation(ctx, userID, project.ID)
	}

	logger.Info(ctx, "handler: investment recorded",
		slog.String("investment_id", investment.ID.String()),
		slog.String("project_id", projectID.String()),
	)
	JSON(w, http.StatusCreated, investment)
}

func (h *InvestmentHandler) ListMyInvestments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, err := uuid.Parse(userIDFromContext_str(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	investments, err := h.investmentRepo.ListByUser(ctx, userID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to list investments")
		return
	}
	JSON(w, http.StatusOK, investments)
}

func (h *InvestmentHandler) ListProjectInvestors(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	investments, err := h.investmentRepo.ListByProject(ctx, projectID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to list investors")
		return
	}

	type investorInfo struct {
		InvestmentID string  `json:"investment_id"`
		UserID       string  `json:"user_id"`
		FullName     string  `json:"full_name"`
		Amount       float64 `json:"amount"`
		Currency     string  `json:"currency"`
		OwnershipPct float64 `json:"ownership_pct"`
		InvestedAt   string  `json:"invested_at"`
	}

	investors := make([]investorInfo, 0, len(investments))
	for _, inv := range investments {
		user, err := h.userRepo.FindByID(ctx, inv.UserID)
		name := "Anonymous"
		if err == nil && user != nil {
			name = user.FullName
		}
		investors = append(investors, investorInfo{
			InvestmentID: inv.ID.String(),
			UserID:       inv.UserID.String(),
			FullName:     name,
			Amount:       inv.Amount,
			Currency:     inv.Currency,
			OwnershipPct: inv.OwnershipPct,
			InvestedAt:   inv.CreatedAt.Format("2006-01-02T15:04:05Z"),
		})
	}
	JSON(w, http.StatusOK, investors)
}

func userIDFromContext_str(ctx context.Context) string {
	return ctx.Value(UserIDKey).(string)
}
