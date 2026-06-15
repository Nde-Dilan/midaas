package contracts

import (
	"context"

	"github.com/google/uuid"
)

type PaymentInput struct {
	Reference     string
	Amount        float64
	Currency      string
	PhoneNumber   string
	Description   string
	CallbackURL   string
}

type PaymentResult struct {
	TransactionRef string
	Status         string
	GatewayRef     string
}

type PayoutInput struct {
	Reference   string
	Amount      float64
	Currency    string
	PhoneNumber string
	Description string
}

type PayoutResult struct {
	TransactionRef string
	Status         string
	GatewayRef     string
}

type WebhookPayload struct {
	Reference string
	Status    string
	Amount    float64
	Currency  string
	Metadata  map[string]string
}

type PaymentService interface {
	InitiatePayment(ctx context.Context, input PaymentInput) (*PaymentResult, error)
	VerifyPayment(ctx context.Context, reference string) (*PaymentResult, error)
	ProcessPayout(ctx context.Context, input PayoutInput) (*PayoutResult, error)
	HandleWebhook(ctx context.Context, payload WebhookPayload) error
}

type PawaPayService interface {
	PaymentService
	ReconcileTransactions(ctx context.Context, startDate, endDate string) error
}

type MilestonePayoutInput struct {
	MilestoneID   uuid.UUID
	EntrepreneurID uuid.UUID
	Amount        float64
	Currency      string
	PhoneNumber   string
}
