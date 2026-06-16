package worker

import (
	"context"
	"log/slog"
	"time"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

func StartAutoCancel(
	projectRepo contracts.ProjectRepository,
	investmentRepo contracts.InvestmentRepository,
	transactionRepo contracts.TransactionRepository,
	log *slog.Logger,
) {
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			ctx := context.Background()
			projects, _, err := projectRepo.List(ctx, contracts.ProjectFilter{
				Status: domain.ProjectStatusFunded,
			})
			if err != nil {
				log.Error("worker: list funded projects failed", slog.String("error", err.Error()))
				continue
			}

			now := time.Now()
			for _, p := range projects {
				if p.AcceptanceDeadline != nil && now.After(*p.AcceptanceDeadline) {
					p.Status = domain.ProjectStatusCancelled
					if err := projectRepo.Update(ctx, &p); err != nil {
						log.Error("worker: cancel project failed", slog.String("project_id", p.ID.String()), slog.String("error", err.Error()))
						continue
					}

					investments, err := investmentRepo.ListByProject(ctx, p.ID)
					if err != nil {
						log.Error("worker: list investments failed", slog.String("project_id", p.ID.String()))
						continue
					}

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
							Description:  "Auto-refund: project acceptance deadline expired",
						}
						if err := transactionRepo.Create(ctx, tx); err != nil {
							log.Error("worker: create refund tx failed", slog.String("error", err.Error()))
						}
					}

					log.Info("worker: project auto-cancelled",
						slog.String("project_id", p.ID.String()),
						slog.Int("refunds", len(investments)),
					)
				}
			}
		}
	}()

	log.Info("worker: auto-cancel started (tick 5min)")
}
