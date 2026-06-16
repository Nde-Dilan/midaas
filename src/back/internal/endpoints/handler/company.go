package handler

import (
	"context"
	"fmt"
	"log/slog"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/logger"
	"github.com/google/uuid"
)

type contextKeyCompany string

const EntrepIDKey contextKeyCompany = "entrepreneur_id"

type CompanyHandler struct {
	companyRepo contracts.CompanyRepository
	entrepRepo  contracts.EntrepreneurRepository
	storage     contracts.ObjectStorageService
}

func NewCompanyHandler(
	companyRepo contracts.CompanyRepository,
	entrepRepo contracts.EntrepreneurRepository,
	storage contracts.ObjectStorageService,
) *CompanyHandler {
	return &CompanyHandler{
		companyRepo: companyRepo,
		entrepRepo:  entrepRepo,
		storage:     storage,
	}
}

func (h *CompanyHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	entrepID, err := uuid.Parse(entrepIDFromContext(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "invalid entrepreneur")
		return
	}

	var input contracts.CreateCompanyInput
	if err := Decode(r, &input); err != nil {
		logger.Warn(ctx, "handler: invalid company body", slog.String("error", err.Error()))
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	input.EntrepreneurID = entrepID
	if input.LegalName == "" || input.CorporateForm == "" {
		JSONError(w, http.StatusBadRequest, "legal_name and corporate_form are required")
		return
	}

	company := &domain.Company{
		ID:              uuid.New(),
		EntrepreneurID:  entrepID,
		Status:          domain.CompanyStatusDraft,
		LegalName:       input.LegalName,
		TradeName:       input.TradeName,
		CorporateForm:   input.CorporateForm,
		IndustrySector:  input.IndustrySector,
		GpsCoordinates:  input.GpsCoordinates,
		PhysicalAddress: input.PhysicalAddress,
	}
	if err := h.companyRepo.Create(ctx, company); err != nil {
		logger.Error(ctx, "handler: failed to create company", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to create company")
		return
	}

	logger.Info(ctx, "handler: company created",
		slog.String("company_id", company.ID.String()),
		slog.String("name", company.LegalName),
	)
	JSON(w, http.StatusCreated, company)
}

func (h *CompanyHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company id")
		return
	}

	company, err := h.companyRepo.FindByIDWithRelations(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "company not found")
		return
	}

	JSON(w, http.StatusOK, company)
}

func (h *CompanyHandler) ListMyCompanies(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	entrepID, err := uuid.Parse(entrepIDFromContext(ctx))
	if err != nil {
		JSONError(w, http.StatusUnauthorized, "invalid entrepreneur")
		return
	}

	companies, err := h.companyRepo.ListByEntrepreneur(ctx, entrepID)
	if err != nil {
		logger.Error(ctx, "handler: list companies failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to list companies")
		return
	}

	JSON(w, http.StatusOK, companies)
}

func (h *CompanyHandler) Submit(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company id")
		return
	}

	company, err := h.companyRepo.FindByID(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "company not found")
		return
	}

	company.Status = domain.CompanyStatusPending
	if err := h.companyRepo.Update(ctx, company); err != nil {
		logger.Error(ctx, "handler: submit company failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to submit company")
		return
	}

	logger.Info(ctx, "handler: company submitted for review",
		slog.String("company_id", company.ID.String()),
	)
	JSON(w, http.StatusOK, company)
}

func (h *CompanyHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	filter := contracts.CompanyFilter{
		IndustrySector: r.URL.Query().Get("industry_sector"),
		CorporateForm:  r.URL.Query().Get("corporate_form"),
		Query:          r.URL.Query().Get("query"),
		Page:           parseInt(r.URL.Query().Get("page"), 1),
		PageSize:       parseInt(r.URL.Query().Get("page_size"), 20),
	}

	companies, total, err := h.companyRepo.ListApproved(ctx, filter)
	if err != nil {
		logger.Error(ctx, "handler: list public companies failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to list companies")
		return
	}

	JSONPaginated(w, http.StatusOK, companies, map[string]interface{}{
		"total":     total,
		"page":      filter.Page,
		"page_size": filter.PageSize,
	})
}

func (h *CompanyHandler) RequestReverify(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company id")
		return
	}

	company, err := h.companyRepo.FindByID(ctx, id)
	if err != nil {
		JSONError(w, http.StatusNotFound, "company not found")
		return
	}

	if company.Status != domain.CompanyStatusApproved {
		JSONError(w, http.StatusBadRequest, "only approved companies can be flagged for reverify")
		return
	}

	company.Status = domain.CompanyStatusReverify
	if err := h.companyRepo.Update(ctx, company); err != nil {
		logger.Error(ctx, "handler: reverify company failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to request reverify")
		return
	}

	logger.Info(ctx, "handler: company reverify requested",
		slog.String("company_id", company.ID.String()),
	)
	JSON(w, http.StatusOK, company)
}

func (h *CompanyHandler) SaveLegalDocs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companyID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company id")
		return
	}
	var input domain.CompanyLegalDocs
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	existing, _ := h.companyRepo.FindLegalDocs(ctx, companyID)
	if existing != nil {
		input.ID = existing.ID
		input.CreatedAt = existing.CreatedAt
	}
	input.CompanyID = companyID
	if err := h.companyRepo.SaveLegalDocs(ctx, &input); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to save legal docs")
		return
	}
	JSON(w, http.StatusOK, &input)
}

func (h *CompanyHandler) SaveFinancials(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companyID, _ := uuid.Parse(r.PathValue("id"))
	var input domain.CompanyFinancials
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	existing, _ := h.companyRepo.FindFinancials(ctx, companyID)
	if existing != nil {
		input.ID = existing.ID
		input.CreatedAt = existing.CreatedAt
	}
	input.CompanyID = companyID
	if err := h.companyRepo.SaveFinancials(ctx, &input); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to save financials")
		return
	}
	JSON(w, http.StatusOK, &input)
}

func (h *CompanyHandler) SaveOperations(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companyID, _ := uuid.Parse(r.PathValue("id"))
	var input domain.CompanyOperations
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	existing, _ := h.companyRepo.FindOperations(ctx, companyID)
	if existing != nil {
		input.ID = existing.ID
		input.CreatedAt = existing.CreatedAt
	}
	input.CompanyID = companyID
	if err := h.companyRepo.SaveOperations(ctx, &input); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to save operations")
		return
	}
	JSON(w, http.StatusOK, &input)
}

func (h *CompanyHandler) AddBeneficialOwner(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companyID, _ := uuid.Parse(r.PathValue("id"))
	var input domain.BeneficialOwner
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.FullName == "" || input.EquityPercentage <= 0 {
		JSONError(w, http.StatusBadRequest, "full_name and equity_percentage are required")
		return
	}
	input.ID = uuid.New()
	input.CompanyID = companyID
	if err := h.companyRepo.AddBeneficialOwner(ctx, &input); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to add beneficial owner")
		return
	}
	JSON(w, http.StatusCreated, &input)
}

func (h *CompanyHandler) RemoveBeneficialOwner(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ownerID, _ := uuid.Parse(r.PathValue("ownerId"))
	if err := h.companyRepo.RemoveBeneficialOwner(ctx, ownerID); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to remove beneficial owner")
		return
	}
	JSON(w, http.StatusOK, map[string]string{"removed": ownerID.String()})
}

func (h *CompanyHandler) AddManager(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	companyID, _ := uuid.Parse(r.PathValue("id"))
	var input domain.CompanyManager
	if err := Decode(r, &input); err != nil {
		JSONError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.FullName == "" {
		JSONError(w, http.StatusBadRequest, "full_name is required")
		return
	}
	input.ID = uuid.New()
	input.CompanyID = companyID
	if err := h.companyRepo.AddManager(ctx, &input); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to add manager")
		return
	}
	JSON(w, http.StatusCreated, &input)
}

func (h *CompanyHandler) RemoveManager(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, _ := uuid.Parse(r.PathValue("managerId"))
	if err := h.companyRepo.RemoveManager(ctx, managerID); err != nil {
		JSONError(w, http.StatusInternalServerError, "failed to remove manager")
		return
	}
	JSON(w, http.StatusOK, map[string]string{"removed": managerID.String()})
}

func (h *CompanyHandler) UploadDocument(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	companyID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		JSONError(w, http.StatusBadRequest, "invalid company id")
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

	category := r.FormValue("category")
	if category == "" {
		JSONError(w, http.StatusBadRequest, "category is required (e.g. rccm, niu, statuts, premises, sector_permits, dsf, bank_statements, momo_statements, collateral, identity)")
		return
	}

	urls, err := h.uploadCompanyFiles(ctx, companyID, category, files)
	if err != nil {
		logger.Error(ctx, "handler: upload documents failed", slog.String("error", err.Error()))
		JSONError(w, http.StatusInternalServerError, "failed to upload documents")
		return
	}

	logger.Info(ctx, "handler: company documents uploaded",
		slog.String("company_id", companyID.String()),
		slog.String("category", category),
		slog.Int("files", len(urls)),
	)
	JSON(w, http.StatusOK, map[string]interface{}{
		"urls":     urls,
		"category": category,
	})
}

func (h *CompanyHandler) uploadCompanyFiles(ctx context.Context, companyID uuid.UUID, category string, files []*multipart.FileHeader) ([]string, error) {
	urls := make([]string, 0, len(files))
	for _, fh := range files {
		file, err := fh.Open()
		if err != nil {
			return nil, fmt.Errorf("open: %w", err)
		}

		ct := fh.Header.Get("Content-Type")
		ext := filepath.Ext(fh.Filename)
		if ext == "" {
			ext = mimeToExt(ct)
		}

		key := fmt.Sprintf("midaas-vault/companies/%s/%s/%s%s",
			companyID, category, uuid.New().String(), ext)

		result, err := h.storage.Upload(ctx, contracts.UploadInput{
			Key:         key,
			Body:        file,
			ContentType: ct,
			Size:        fh.Size,
			Public:      true,
		})
		file.Close()
		if err != nil {
			return nil, fmt.Errorf("upload: %w", err)
		}
		urls = append(urls, result.URL)
	}
	return urls, nil
}

func entrepIDFromContext(ctx context.Context) string {
	return ctx.Value(EntrepIDKey).(string)
}

func parseInt(s string, fallback int) int {
	if s == "" {
		return fallback
	}
	v, err := strconv.Atoi(s)
	if err != nil || v < 1 {
		return fallback
	}
	return v
}
