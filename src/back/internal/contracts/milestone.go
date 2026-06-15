package contracts

import (
	"context"
	"mime/multipart"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type CreateMilestoneInput struct {
	ProjectID      uuid.UUID
	Title          string
	Description    string
	OrderNum       int
	FundAllocation float64
	DueDate        string
}

type UploadProofInput struct {
	MilestoneID uuid.UUID
	Files       []*multipart.FileHeader
	Notes       string
}

type ReviewMilestoneInput struct {
	MilestoneID uuid.UUID
	Approved    bool
	Feedback    string
	ReviewedBy  uuid.UUID
}

type MilestoneService interface {
	Create(ctx context.Context, input CreateMilestoneInput) (*domain.Milestone, error)
	CreateBatch(ctx context.Context, projectID uuid.UUID, inputs []CreateMilestoneInput) ([]domain.Milestone, error)
	ListByProject(ctx context.Context, projectID uuid.UUID) ([]domain.Milestone, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Milestone, error)
	Update(ctx context.Context, id uuid.UUID, input CreateMilestoneInput) (*domain.Milestone, error)
	UploadProof(ctx context.Context, input UploadProofInput) error
	Review(ctx context.Context, input ReviewMilestoneInput) error
	AutoDisburse(ctx context.Context, milestoneID uuid.UUID) error
}
