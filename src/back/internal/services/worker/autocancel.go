package worker

import (
	"context"
	"log/slog"
	"time"

	"github.com/MiltonJ23/Midaas/internal/adapters/pawapay"
	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/google/uuid"
)

func StartAutoCancel(
	projectRepo contracts.ProjectRepository,
	investmentRepo contracts.InvestmentRepository,
	transactionRepo contracts.TransactionRepository,
	notifSvc contracts.NotificationService,
	pawaPay *pawapay.Client,
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
						log.Error("worker: cancel failed", slog.String("pid", p.ID.String()), slog.String("error", err.Error()))
						continue
					}

					investments, err := investmentRepo.ListByProject(ctx, p.ID)
					if err != nil {
						log.Error("worker: list investments failed", slog.String("pid", p.ID.String()))
						continue
					}

					for _, inv := range investments {
						refundID := uuid.New().String()
						tx := &domain.Transaction{
							ID: uuid.New(), UserID: inv.UserID, InvestmentID: &inv.ID,
							Type: domain.TransactionTypeRefund, Amount: inv.Amount, Currency: inv.Currency,
							Direction: domain.TransactionDirectionCredit, Status: domain.TransactionStatusCompleted,
							GatewayRef: refundID,
							Description: "Auto-refund: project acceptance deadline expired",
						}
						transactionRepo.Create(ctx, tx)

						if pawaPay != nil && inv.DepositID != "" {
							rReq := pawapay.RefundRequest{RefundID: refundID, DepositID: inv.DepositID}
							go func(depID string) {
								if resp, err := pawaPay.InitiateRefund(context.Background(), rReq); err != nil {
									log.Error("worker: pawapay refund failed", slog.String("error", err.Error()))
								} else if resp.Status == "ACCEPTED" {
									log.Info("worker: pawapay refund initiated", slog.String("refund_id", refundID))
								}
							}(inv.DepositID)
						}

						if notifSvc != nil {
							go notifSvc.SendRefundNotification(context.Background(), inv.UserID, p.ID, inv.Amount, inv.Currency)
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
