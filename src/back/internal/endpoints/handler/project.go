package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"mime/multipart"
	"net/http"
	"strconv"
	"time"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	"github.com/google/uuid"
)

type ProjectHandler struct {
	projectRepo    contracts.ProjectRepository
	milestoneRepo  contracts.MilestoneRepository
	investmentRepo contracts.InvestmentRepository
	transactionRepo contracts.TransactionRepository
	companyRepo    contracts.CompanyRepository
	entrepRepo     contracts.EntrepreneurRepository
	userRepo       contracts.UserRepository
	storage        contracts.ObjectStorageService
	notifSvc       contracts.NotificationService
}

func NewProjectHandler(
	projectRepo contracts.ProjectRepository,
	milestoneRepo contracts.MilestoneRepository,
	investmentRepo contracts.InvestmentRepository,
	transactionRepo contracts.TransactionRepository,
	companyRepo contracts.CompanyRepository,
	entrepRepo contracts.EntrepreneurRepository,
	userRepo contracts.UserRepository,
	storage contracts.ObjectStorageService,
	notifSvc contracts.NotificationService,
) *ProjectHandler {
	return &ProjectHandler{
		projectRepo:     projectRepo,
		milestoneRepo:   milestoneRepo,
		investmentRepo:  investmentRepo,
		transactionRepo: transactionRepo,
		companyRepo:     companyRepo,
		entrepRepo:      entrepRepo,
		userRepo:        userRepo,
		storage:         storage,
		notifSvc:        notifSvc,
	}
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	entrepID, err := uuid.Parse(entrepIDFromContext(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "invalid entrepreneur")
		return
	}

	var input struct {
		Title                  string                 `json:"title"`
		Description            string                 `json:"description"`
		FundingGoal            float64                `json:"funding_goal"`
		Currency               string                 `json:"currency"`
		Category               string                 `json:"category"`
		CoverImageUrl          string                 `json:"cover_image_url"`
		StartDate              string                 `json:"start_date"`
		EndDate                string                 `json:"end_date"`
		CompanyID              string                 `json:"company_id"`
		Milestones             []createMilestoneInput `json:"milestones"`
		ShortTermROI           float64                `json:"short_term_roi"`
		ShortTermMonths        int                    `json:"short_term_months"`
		MediumTermROI          float64                `json:"medium_term_roi"`
		MediumTermMonths       int                    `json:"medium_term_months"`
		LongTermROI            float64                `json:"long_term_roi"`
		LongTermMonths         int                    `json:"long_term_months"`
		BreakEvenMonths        int                    `json:"break_even_months"`
		RiskZones              []RiskZoneInput        `json:"risk_zones"`
		UseOfFunds             []UseOfFundsInput      `json:"use_of_funds"`
		BusinessPlanDocs       []string               `json:"business_plan_docs"`
		FinancialProjections   []string               `json:"financial_projections"`
		MarketAnalysis         string                 `json:"market_analysis"`
		CompetitiveAdvantage   string                 `json:"competitive_advantage"`
		TeamBackground         string                 `json:"team_background"`
	}
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.Title == "" || input.FundingGoal <= 0 || input.CompanyID == "" {
		JSONError(w, http.StatusBadRequest, "title, funding_goal, and company_id are required")
		return
	}

	companyID, err := uuid.Parse(input.CompanyID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company_id")
		return
	}

	currency := input.Currency
	if currency == "" {
		currency = "XOF"
	}

	var startDate, endDate *time.Time
	if input.StartDate != "" {
		t, _ := time.Parse("2006-01-02", input.StartDate)
		startDate = &t
	}
	if input.EndDate != "" {
		t, _ := time.Parse("2006-01-02", input.EndDate)
		endDate = &t
	}

	project := &domain.Project{
		ID:             uuid.New(),
		CompanyID:      companyID,
		EntrepreneurID: entrepID,
		Title:          input.Title,
		Description:    input.Description,
		FundingGoal:    input.FundingGoal,
		FundingRaised:  0,
		Currency:       currency,
		Status:         domain.ProjectStatusDraft,
		Category:       input.Category,
		CoverImageUrl:  input.CoverImageUrl,
		StartDate:      startDate,
		EndDate:        endDate,

		ShortTermROI:         input.ShortTermROI,
		ShortTermMonths:      input.ShortTermMonths,
		MediumTermROI:        input.MediumTermROI,
		MediumTermMonths:     input.MediumTermMonths,
		LongTermROI:          input.LongTermROI,
		LongTermMonths:       input.LongTermMonths,
		BreakEvenMonths:      input.BreakEvenMonths,
		MarketAnalysis:       input.MarketAnalysis,
		CompetitiveAdvantage: input.CompetitiveAdvantage,
		TeamBackground:       input.TeamBackground,
	}

	if len(input.RiskZones) > 0 {
		raw, _ := json.Marshal(input.RiskZones)
		project.RiskZones = raw
	}
	if len(input.UseOfFunds) > 0 {
		raw, _ := json.Marshal(input.UseOfFunds)
		project.UseOfFunds = raw
	}
	if len(input.BusinessPlanDocs) > 0 {
		raw, _ := json.Marshal(input.BusinessPlanDocs)
		project.BusinessPlanDocs = raw
	}
	if len(input.FinancialProjections) > 0 {
		raw, _ := json.Marshal(input.FinancialProjections)
		project.FinancialProjections = raw
	}

	if err := h.projectRepo.Create(ctx, project); err != nil {
		logger.Error(ctx, "handler: create project failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	if len(input.Milestones) > 0 {
		milestones := make([]domain.Milestone, len(input.Milestones))
		for i, m := range input.Milestones {
			var due *time.Time
			if m.DueDate != "" {
				t, _ := time.Parse("2006-01-02", m.DueDate)
				due = &t
			}
			milestones[i] = domain.Milestone{
				ID:             uuid.New(),
				ProjectID:      project.ID,
				Title:          m.Title,
				Description:    m.Description,
				OrderNum:       m.OrderNum,
				FundAllocation: m.FundAllocation,
				Status:         domain.MilestoneStatusPending,
				DueDate:        due,
			}
		}
		if err := h.milestoneRepo.CreateBatch(ctx, milestones); err != nil {
			logger.Error(ctx, "handler: create milestones failed", slog.String("error", err.Error()))
		}
	}

	logger.Info(ctx, "handler: project created", slog.String("project_id", project.ID.String()))
	JSON(w, http.StatusCreated, project)
}

func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.projectRepo.FindByIDWithRelations(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "project not found")
		return
	}
	JSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	filter := contracts.ProjectFilter{
		Category: r.URL.Query().Get("category"),
		Status:   r.URL.Query().Get("status"),
		Currency: r.URL.Query().Get("currency"),
		Query:    r.URL.Query().Get("query"),
		Page:     parseInt(r.URL.Query().Get("page"), 1),
		PageSize: parseInt(r.URL.Query().Get("page_size"), 20),
	}
	if v := r.URL.Query().Get("min_goal"); v != "" {
		filter.MinGoal, _ = strconv.ParseFloat(v, 64)
	}
	if v := r.URL.Query().Get("max_goal"); v != "" {
		filter.MaxGoal, _ = strconv.ParseFloat(v, 64)
	}
	if filter.Status == "" {
		filter.Status = domain.ProjectStatusActive
	}

	projects, total, err := h.projectRepo.List(ctx, filter)
	if err != nil {
		logger.Error(ctx, "handler: list projects failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to list projects")
		return
	}
	JSONPaginated(w, http.StatusOK, projects, map[string]interface{}{
		"total": total, "page": filter.Page, "page_size": filter.PageSize,
	})
}

func (h *ProjectHandler) ListMyProjects(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	entrepID, err := uuid.Parse(entrepIDFromContext(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "invalid entrepreneur")
		return
	}
	projects, err := h.projectRepo.ListByEntrepreneur(ctx, entrepID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to list projects")
		return
	}
	JSON(w, http.StatusOK, projects)
}

func (h *ProjectHandler) Submit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.projectRepo.FindByID(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "project not found")
		return
	}
	project.Status = domain.ProjectStatusPending
	if err := h.projectRepo.Update(ctx, project); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to submit project")
		return
	}
	JSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) UploadMilestoneProof(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	mID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid milestone id")
		return
	}
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		JSONError(w, http.StatusBadRequest, "file too large, max 10MB each")
		return
	}
	files := r.MultipartForm.File["files"]
	if len(files) == 0 {
		JSONError(w, http.StatusBadRequest, "files field is required")
		return
	}
	notes := r.FormValue("notes")

	urls, err := h.uploadMilestoneDocs(ctx, mID, files)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to upload proofs")
		return
	}

	milestone, err := h.milestoneRepo.FindByID(ctx, mID)
	if err != nil {
		JSONError(w, http.StatusNotFound, "milestone not found")
		return
	}

	existing := []string{}
	if milestone.ProofDocs != nil {
		json.Unmarshal(milestone.ProofDocs, &existing)
	}
	all := append(existing, urls...)
	raw, _ := json.Marshal(all)
	milestone.ProofDocs = raw
	milestone.ProofNotes = notes
	milestone.Status = domain.MilestoneStatusUnderReview

	if err := h.milestoneRepo.Update(ctx, milestone); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to update milestone")
		return
	}
	JSON(w, http.StatusOK, map[string]interface{}{"urls": urls, "milestone_id": mID.String()})
}

func (h *ProjectHandler) uploadMilestoneDocs(ctx context.Context, id uuid.UUID, files []*multipart.FileHeader) ([]string, error) {
	urls := make([]string, 0, len(files))
	for _, fh := range files {
		file, err := fh.Open()
		if err != nil {
			return nil, fmt.Errorf("open: %w", err)
		}
		key := fmt.Sprintf("midaas-vault/milestones/%s/%s", id.String(), uuid.New().String())
		result, err := h.storage.Upload(ctx, contracts.UploadInput{
			Key: key, Body: file, ContentType: fh.Header.Get("Content-Type"),
			Size: fh.Size, Public: true,
		})
		file.Close()
		if err != nil {
			return nil, fmt.Errorf("upload: %w", err)
		}
		urls = append(urls, result.URL)
	}
	return urls, nil
}

func (h *ProjectHandler) Accept(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.projectRepo.FindByID(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "project not found")
		return
	}
	if project.Status != domain.ProjectStatusFunded {
		JSONError(w, http.StatusBadRequest, "project must be fully funded before acceptance")
		return
	}
	now := time.Now()
	project.Status = domain.ProjectStatusActive
	project.AcceptedAt = &now
	h.projectRepo.Update(ctx, project)

	milestones, _ := h.milestoneRepo.ListByProject(ctx, id)
	if len(milestones) > 0 && milestones[0].Status == domain.MilestoneStatusPending {
		milestones[0].Status = domain.MilestoneStatusActive
		h.milestoneRepo.Update(ctx, &milestones[0])
	}

	logger.Info(ctx, "handler: project accepted", slog.String("project_id", id.String()))
	JSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.projectRepo.FindByID(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "project not found")
		return
	}
	if project.Status != domain.ProjectStatusFunded {
		JSONError(w, http.StatusBadRequest, "project must be in funded state to cancel")
		return
	}

	h.cancelProject(ctx, project)
	JSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) cancelProject(ctx context.Context, project *domain.Project) {
	project.Status = domain.ProjectStatusCancelled
	h.projectRepo.Update(ctx, project)

	investments, _ := h.investmentRepo.ListByProject(ctx, project.ID)
	for _, inv := range investments {
		tx := &domain.Transaction{
			ID:           uuid.New(),
			UserID:       inv.UserID,
			InvestmentID: &inv.ID,
			Type:         domain.TransactionTypeRefund,
			Amount:       inv.Amount,
			Currency:     inv.Currency,
			Direction:    domain.TransactionDirectionCredit,
			Status:       domain.TransactionStatusCompleted,
			Description:  fmt.Sprintf("Refund for cancelled project: %s", project.Title),
		}
		h.transactionRepo.Create(ctx, tx)
	}

	logger.Info(ctx, "handler: project cancelled",
		slog.String("project_id", project.ID.String()),
		slog.Int("refunds", len(investments)),
	)
}

func (h *ProjectHandler) Discover(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	filter := contracts.ProjectFilter{
		Status:   domain.ProjectStatusActive,
		Page:     1,
		PageSize: 10,
	}
	projects, total, err := h.projectRepo.List(ctx, filter)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to list projects")
		return
	}

	type DiscoverProject struct {
		ID            string  `json:"id"`
		Title         string  `json:"title"`
		Summary       string  `json:"summary"`
		FundingGoal   float64 `json:"funding_goal"`
		FundingRaised float64 `json:"funding_raised"`
		Currency      string  `json:"currency"`
		Category      string  `json:"category"`
		CoverImageUrl string  `json:"cover_image_url"`
		CompanyName   string  `json:"company_name"`
		ShortTermROI  float64 `json:"short_term_roi"`
		InvestorsCount int   `json:"investors_count"`
	}

	result := make([]DiscoverProject, 0, len(projects))
	for _, p := range projects {
		companyName := ""
		if c, err := h.companyRepo.FindByID(ctx, p.CompanyID); err == nil && c != nil {
			companyName = c.LegalName
		}
		investments, _ := h.investmentRepo.ListByProject(ctx, p.ID)

		summary := p.Description
		if len(summary) > 200 {
			summary = summary[:200] + "..."
		}

		result = append(result, DiscoverProject{
			ID:             p.ID.String(),
			Title:          p.Title,
			Summary:        summary,
			FundingGoal:    p.FundingGoal,
			FundingRaised:  p.FundingRaised,
			Currency:       p.Currency,
			Category:       p.Category,
			CoverImageUrl:  p.CoverImageUrl,
			CompanyName:    companyName,
			ShortTermROI:   p.ShortTermROI,
			InvestorsCount: len(investments),
		})
	}

	JSONPaginated(w, http.StatusOK, result, map[string]interface{}{
		"total": total, "page": 1, "page_size": 10,
	})
}

type createMilestoneInput struct {
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	OrderNum       int     `json:"order_num"`
	FundAllocation float64 `json:"fund_allocation"`
	DueDate        string  `json:"due_date"`
}

type RiskZoneInput struct {
	Description string `json:"description"`
	Severity    string `json:"severity"`
	Mitigation  string `json:"mitigation"`
}

type UseOfFundsInput struct {
	Category   string  `json:"category"`
	Amount     float64 `json:"amount"`
	Percentage float64 `json:"percentage"`
	Details    string  `json:"details"`
}
