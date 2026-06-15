package contracts

import (
	"context"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

type PortfolioService interface {
	Get(ctx context.Context, userID uuid.UUID) (*domain.Portfolio, error)
}
