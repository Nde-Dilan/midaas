package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type TransactionService interface {
	ListByUser(ctx context.Context, userID uuid.UUID, page, pageSize int) ([]domain.Transaction, int64, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Transaction, error)
}
