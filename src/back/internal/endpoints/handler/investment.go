package handler

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/MiltonJ23/Midaas/internal/adapters/pawapay"
	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	"github.com/google/uuid"
)

type InvestmentHandler struct {
	investmentRepo  contracts.InvestmentRepository
	projectRepo     contracts.ProjectRepository
	userRepo        contracts.UserRepository
	companyRepo     contracts.CompanyRepository
	transactionRepo contracts.TransactionRepository
	notifSvc        contracts.NotificationService
	pawaPay         *pawapay.Client
	platformFeePct  float64
}

func NewInvestmentHandler(
	investmentRepo contracts.InvestmentRepository,
	projectRepo contracts.ProjectRepository,
	userRepo contracts.UserRepository,
	companyRepo contracts.CompanyRepository,
	transactionRepo contracts.TransactionRepository,
	notifSvc contracts.NotificationService,
	pawaPay *pawapay.Client,
) *InvestmentHandler {
	return &InvestmentHandler{
		investmentRepo:  investmentRepo,
		projectRepo:     projectRepo,
		userRepo:        userRepo,
		companyRepo:     companyRepo,
		transactionRepo: transactionRepo,
		notifSvc:        notifSvc,
		pawaPay:         pawaPay,
		platformFeePct:  5.0,
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
		Amount      float64 `json:"amount"`
		Currency    string  `json:"currency"`
		PhoneNumber string  `json:"phone_number"`
		Provider    string  `json:"provider"`
	}
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.Amount <= 0 {
		JSONError(w, http.StatusBadRequest, "amount must be positive")
		return
	}
	if input.PhoneNumber == "" {
		JSONError(w, http.StatusBadRequest, "phone_number is required for mobile money payment")
		return
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

	remaining := project.FundingGoal - project.FundingRaised
	if input.Amount > remaining {
		JSONError(w, http.StatusBadRequest, fmt.Sprintf("amount exceeds remaining funding: %.2f %s", remaining, project.Currency))
		return
	}

	currency := input.Currency
	if currency == "" {
		currency = project.Currency
	}

	feeAmt := input.Amount * h.platformFeePct / 100
	totalCharge := input.Amount + feeAmt
	ownershipPct := (input.Amount / project.FundingGoal) * 100

	depositID := uuid.New().String()

	investment := &domain.Investment{
		ID:             uuid.New(),
		ProjectID:      projectID,
		UserID:         userID,
		Amount:         input.Amount,
		Currency:       currency,
		OwnershipPct:   ownershipPct,
		PlatformFeePct: h.platformFeePct,
		PlatformFeeAmt: feeAmt,
		NetAmount:      input.Amount,
		Status:         domain.InvestmentStatusConfirmed,
		DepositID:      depositID,
	}
	if err := h.investmentRepo.Create(ctx, investment); err != nil {
		logger.Error(ctx, "handler: create investment failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to record investment")
		return
	}

	if h.pawaPay != nil {
		depReq := pawapay.DepositRequest{
			DepositID: depositID,
			Amount:    fmt.Sprintf("%.2f", totalCharge),
			Currency:  currency,
		}
		depReq.Payer.Type = "MMO"
		depReq.Payer.AccountDetails.PhoneNumber = input.PhoneNumber
		depReq.Payer.AccountDetails.Provider = input.Provider
		depReq.CustomerMessage = fmt.Sprintf("Invest %s", project.Title[:min(22, len(project.Title))])

		resp, err := h.pawaPay.InitiateDeposit(context.Background(), depReq)
		if err != nil {
			logger.Error(ctx, "handler: pawapay deposit failed", slog.String("error", err.Error()))
		} else if resp.Status == "ACCEPTED" {
			investment.Status = domain.InvestmentStatusConfirmed
			h.investmentRepo.Update(ctx, investment)
		}
	}

	now := time.Now()

	invTx := &domain.Transaction{
		ID:           uuid.New(),
		UserID:       userID,
		InvestmentID: &investment.ID,
		Type:         domain.TransactionTypeInvestment,
		Amount:       totalCharge,
		Currency:     currency,
		Direction:    domain.TransactionDirectionDebit,
		Status:       domain.TransactionStatusCompleted,
		GatewayRef:   depositID,
		Description:  fmt.Sprintf("Investment in %s (%.0f%% fee included) via %s", project.Title, h.platformFeePct, input.Provider),
		CreatedAt:    now,
	}
	h.transactionRepo.Create(ctx, invTx)

	if feeAmt > 0 {
		feeTx := &domain.Transaction{
			ID:           uuid.New(),
			UserID:       userID,
			InvestmentID: &investment.ID,
			Type:         "platform_fee",
			Amount:       feeAmt,
			Currency:     currency,
			Direction:    domain.TransactionDirectionDebit,
			Status:       domain.TransactionStatusCompleted,
			GatewayRef:   depositID,
			Description:  fmt.Sprintf("Platform fee (%.0f%%) for %s", h.platformFeePct, project.Title),
			CreatedAt:    now,
		}
		h.transactionRepo.Create(ctx, feeTx)
	}

	project.FundingRaised += input.Amount
	if project.FundingRaised >= project.FundingGoal {
		project.Status = domain.ProjectStatusFunded
		deadline := time.Now().Add(48 * time.Hour)
		project.AcceptanceDeadline = &deadline
	}
	h.projectRepo.Update(ctx, project)

	if h.notifSvc != nil {
		uid := userID
		pid := project.ID
		go h.notifSvc.SendInvestmentConfirmation(context.Background(), uid, pid)
	}

	logger.Info(ctx, "handler: investment recorded",
		slog.String("investment_id", investment.ID.String()),
		slog.Float64("amount", input.Amount),
		slog.Float64("fee", feeAmt),
		slog.Float64("total", totalCharge),
		slog.String("deposit_id", depositID),
	)

	JSON(w, http.StatusCreated, map[string]interface{}{
		"investment":       investment,
		"invested_amount":  input.Amount,
		"platform_fee_pct": h.platformFeePct,
		"platform_fee_amt": feeAmt,
		"total_charge":     totalCharge,
		"remaining":        project.FundingGoal - project.FundingRaised,
		"funding_progress": fmt.Sprintf("%.1f%%", project.FundingRaised/project.FundingGoal*100),
		"deposit_id":       depositID,
	})
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
		InvestmentID   string  `json:"investment_id"`
		UserID         string  `json:"user_id"`
		FullName       string  `json:"full_name"`
		Amount         float64 `json:"amount"`
		Currency       string  `json:"currency"`
		OwnershipPct   float64 `json:"ownership_pct"`
		PlatformFeePct float64 `json:"platform_fee_pct"`
		InvestedAt     string  `json:"invested_at"`
	}

	investors := make([]investorInfo, 0, len(investments))
	for _, inv := range investments {
		user, err := h.userRepo.FindByID(ctx, inv.UserID)
		name := "Anonymous"
		if err == nil && user != nil {
			name = user.FullName
		}
		investors = append(investors, investorInfo{
			InvestmentID:   inv.ID.String(),
			UserID:         inv.UserID.String(),
			FullName:       name,
			Amount:         inv.Amount,
			Currency:       inv.Currency,
			OwnershipPct:   inv.OwnershipPct,
			PlatformFeePct: inv.PlatformFeePct,
			InvestedAt:     inv.CreatedAt.Format("2006-01-02T15:04:05Z"),
		})
	}
	JSON(w, http.StatusOK, investors)
}

func (h *InvestmentHandler) MyTransactions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, err := uuid.Parse(userIDFromContext_str(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	txns, _, err := h.transactionRepo.ListByUser(ctx, userID, 1, 100)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to list transactions")
		return
	}
	JSON(w, http.StatusOK, txns)
}

func (h *InvestmentHandler) Portfolio(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, err := uuid.Parse(userIDFromContext_str(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	investments, err := h.investmentRepo.ListByUser(ctx, userID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to load investments")
		return
	}

	type PortfolioItem struct {
		InvestmentID string  `json:"investment_id"`
		ProjectID    string  `json:"project_id"`
		ProjectTitle string  `json:"project_title"`
		CompanyName  string  `json:"company_name"`
		CreatedAt    string  `json:"project_created"`
		Amount       float64 `json:"amount"`
		Currency     string  `json:"currency"`
		OwnershipPct float64 `json:"ownership_pct"`
		ProjectStatus string `json:"project_status"`
	}

	totalValue := 0.0
	items := make([]PortfolioItem, 0, len(investments))

	for _, inv := range investments {
		project, err := h.projectRepo.FindByID(ctx, inv.ProjectID)
		title := "(unknown)"
		status := ""
		created := ""
		companyName := ""
		if err == nil && project != nil {
			title = project.Title
			status = project.Status
			created = project.CreatedAt.Format("2006-01-02")
			if c, cerr := h.companyRepo.FindByID(ctx, project.CompanyID); cerr == nil && c != nil {
				companyName = c.LegalName
			}
		}

		totalValue += inv.Amount

		items = append(items, PortfolioItem{
			InvestmentID:  inv.ID.String(),
			ProjectID:     inv.ProjectID.String(),
			ProjectTitle:  title,
			CompanyName:   companyName,
			CreatedAt:     created,
			Amount:        inv.Amount,
			Currency:      inv.Currency,
			OwnershipPct:  inv.OwnershipPct,
			ProjectStatus: status,
		})
	}

	JSON(w, http.StatusOK, map[string]interface{}{
		"total_value": totalValue,
		"currency":    "XOF",
		"investments": items,
	})
}

func userIDFromContext_str(ctx context.Context) string {
	return ctx.Value(UserIDKey).(string)
}
