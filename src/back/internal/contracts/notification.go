package contracts

import (
	"context"

	"github.com/google/uuid"
)

type EmailMessage struct {
	To          []string
	Subject     string
	HTML        string
	Attachments []EmailAttachment
}

type EmailAttachment struct {
	Filename    string
	URL         string
}

type EmailService interface {
	Send(ctx context.Context, msg EmailMessage) error
}

type NotificationService interface {
	SendMilestoneApproved(ctx context.Context, projectID, milestoneID uuid.UUID, proofURLs []string) error
	SendMilestoneRejected(ctx context.Context, projectID, milestoneID uuid.UUID, feedback string) error
	SendRegistrationConfirmation(ctx context.Context, email, fullName string) error
	SendInvestmentConfirmation(ctx context.Context, userID, projectID uuid.UUID) error
}
