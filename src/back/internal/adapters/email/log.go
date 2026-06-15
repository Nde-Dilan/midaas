package email

import (
	"context"
	"log/slog"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/logger"
)

type logAdapter struct{}

func NewLogAdapter() contracts.EmailService {
	return &logAdapter{}
}

func (a *logAdapter) Send(ctx context.Context, msg contracts.EmailMessage) error {
	logger.Info(ctx, "email: would send (log mode)",
		slog.String("to", msg.To[0]),
		slog.String("subject", msg.Subject),
	)
	return nil
}
