package notification

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/logger"
	"github.com/google/uuid"
)

type notificationService struct {
	emailSvc   contracts.EmailService
	milestoneRepo contracts.MilestoneRepository
	projectRepo   contracts.ProjectRepository
	investmentRepo contracts.InvestmentRepository
	userRepo      contracts.UserRepository
	fromEmail     string
}

func NewNotificationService(
	emailSvc contracts.EmailService,
	milestoneRepo contracts.MilestoneRepository,
	projectRepo contracts.ProjectRepository,
	investmentRepo contracts.InvestmentRepository,
	userRepo contracts.UserRepository,
	fromEmail string,
) contracts.NotificationService {
	return &notificationService{
		emailSvc:       emailSvc,
		milestoneRepo:  milestoneRepo,
		projectRepo:    projectRepo,
		investmentRepo: investmentRepo,
		userRepo:       userRepo,
		fromEmail:      fromEmail,
	}
}

func (s *notificationService) SendMilestoneApproved(
	ctx context.Context, projectID, milestoneID uuid.UUID, proofURLs []string,
) error {
	milestone, err := s.milestoneRepo.FindByID(ctx, milestoneID)
	if err != nil {
		return fmt.Errorf("find milestone: %w", err)
	}

	project, err := s.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		return fmt.Errorf("find project: %w", err)
	}

	investments, err := s.investmentRepo.ListByProject(ctx, projectID)
	if err != nil {
		return fmt.Errorf("list investments: %w", err)
	}

	proofImages := buildProofGallery(proofURLs)

	for _, inv := range investments {
		user, err := s.userRepo.FindByID(ctx, inv.UserID)
		if err != nil {
			logger.Warn(ctx, "notification: user not found for investment",
				slog.String("investment_id", inv.ID.String()),
				slog.String("error", err.Error()),
			)
			continue
		}

		html := buildMilestoneApprovedEmail(
			user.FullName,
			project.Title,
			milestone.Title,
			milestone.Description,
			proofImages,
		)

		msg := contracts.EmailMessage{
			To:      []string{user.Email},
			Subject: fmt.Sprintf("Milestone %s completed for %s", milestone.Title, project.Title),
			HTML:    html,
		}

		if err := s.emailSvc.Send(ctx, msg); err != nil {
			logger.Error(ctx, "notification: failed to send milestone email",
				slog.String("user_id", user.ID.String()),
				slog.String("error", err.Error()),
			)
			continue
		}

		logger.Info(ctx, "notification: milestone approved email sent",
			slog.String("user_id", user.ID.String()),
			slog.String("project", project.Title),
		)
	}

	return nil
}

func (s *notificationService) SendMilestoneRejected(
	ctx context.Context, projectID, milestoneID uuid.UUID, feedback string,
) error {
	project, err := s.projectRepo.FindByID(ctx, projectID)
	if err != nil {
		return fmt.Errorf("find project: %w", err)
	}

	milestone, err := s.milestoneRepo.FindByID(ctx, milestoneID)
	if err != nil {
		return fmt.Errorf("find milestone: %w", err)
	}

	investments, err := s.investmentRepo.ListByProject(ctx, projectID)
	if err != nil {
		return fmt.Errorf("list investments: %w", err)
	}

	for _, inv := range investments {
		user, err := s.userRepo.FindByID(ctx, inv.UserID)
		if err != nil {
			continue
		}

		html := buildMilestoneRejectedEmail(
			user.FullName,
			project.Title,
			milestone.Title,
			feedback,
		)

		msg := contracts.EmailMessage{
			To:      []string{user.Email},
			Subject: fmt.Sprintf("Update: %s milestone review for %s", milestone.Title, project.Title),
			HTML:    html,
		}

		if err := s.emailSvc.Send(ctx, msg); err != nil {
			logger.Error(ctx, "notification: failed to send rejection email",
				slog.String("error", err.Error()),
			)
		}
	}

	return nil
}

func (s *notificationService) SendRegistrationConfirmation(ctx context.Context, email, fullName string) error {
	html := fmt.Sprintf(`
	<html><body style="font-family:Arial,sans-serif;padding:40px">
	<h2>Welcome to Midaas, %s!</h2>
	<p>Your account has been created successfully.</p>
	<p>You can now explore investment opportunities or apply to become an entrepreneur.</p>
	<hr>
	<p style="color:#888;font-size:12px">Midaas — Invest in Real Businesses</p>
	</body></html>`, fullName)

	return s.emailSvc.Send(ctx, contracts.EmailMessage{
		To:      []string{email},
		Subject: "Welcome to Midaas",
		HTML:    html,
	})
}

func (s *notificationService) SendInvestmentConfirmation(ctx context.Context, userID, projectID uuid.UUID) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("find user: %w", err)
	}

	project, err := s.projectRepo.FindByIDWithRelations(ctx, projectID)
	if err != nil {
		return fmt.Errorf("find project: %w", err)
	}

	var roiSection string
	if project.ShortTermROI > 0 || project.MediumTermROI > 0 || project.LongTermROI > 0 {
		roiSection = "<h3>ROI Projections</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%%'>"
		if project.ShortTermROI > 0 {
			roiSection += fmt.Sprintf("<tr><td>Court terme (%d mois)</td><td><strong>%.1f%%</strong></td></tr>", project.ShortTermMonths, project.ShortTermROI)
		}
		if project.MediumTermROI > 0 {
			roiSection += fmt.Sprintf("<tr><td>Moyen terme (%d mois)</td><td><strong>%.1f%%</strong></td></tr>", project.MediumTermMonths, project.MediumTermROI)
		}
		if project.LongTermROI > 0 {
			roiSection += fmt.Sprintf("<tr><td>Long terme (%d mois)</td><td><strong>%.1f%%</strong></td></tr>", project.LongTermMonths, project.LongTermROI)
		}
		roiSection += "</table>"
	}

	var breakEven string
	if project.BreakEvenMonths > 0 {
		breakEven = fmt.Sprintf("<p><strong>Point mort:</strong> %d mois</p>", project.BreakEvenMonths)
	}

	var riskSection string
	if project.RiskZones != nil {
		riskSection = "<h3>Risques identifies</h3><ul>"
		riskSection += fmt.Sprintf("<li>Voir le dossier complet du projet</li>")
		riskSection += "</ul>"
	}

	var docsSection string
	if project.BusinessPlanDocs != nil || project.FinancialProjections != nil {
		docsSection = "<h3>Documents</h3><p>Tous les documents (business plan, projections financieres) sont disponibles sur la plateforme.</p>"
	}

	html := fmt.Sprintf(`
	<html><body style="font-family:Arial,sans-serif;padding:40px">
	<h2>Investment Confirmed!</h2>
	<p>Hello %s,</p>
	<p>Your investment in <strong>%s</strong> has been confirmed.</p>
	<h3>Project Overview</h3>
	<p>%s</p>
	%s
	%s
	<p><strong>Funding Goal:</strong> %.2f %s | <strong>Category:</strong> %s</p>
	%s
	%s
	<h3>Market Analysis</h3>
	<p>%s</p>
	<h3>Competitive Advantage</h3>
	<p>%s</p>
	<p>You can track the project progress and milestones from your portfolio.</p>
	<hr>
	<p style="color:#888;font-size:12px">Midaas — Invest in Real Businesses</p>
	</body></html>`,
		user.FullName, project.Title, project.Description,
		roiSection, breakEven,
		project.FundingGoal, project.Currency, project.Category,
		riskSection, docsSection,
		truncate(project.MarketAnalysis, 500),
		truncate(project.CompetitiveAdvantage, 500),
	)

	return s.emailSvc.Send(ctx, contracts.EmailMessage{
		To:      []string{user.Email},
		Subject: fmt.Sprintf("Investment confirmed — %s", project.Title),
		HTML:    html,
	})
}

func buildProofGallery(urls []string) string {
	if len(urls) == 0 {
		return "<p>No proofs attached.</p>"
	}
	var imgs strings.Builder
	for _, url := range urls {
		imgs.WriteString(fmt.Sprintf(
			`<img src="%s" style="max-width:100%%;margin:8px 0;border-radius:8px;border:1px solid #ddd" alt="Milestone proof"/>`,
			url,
		))
	}
	return imgs.String()
}

func buildMilestoneApprovedEmail(fullName, projectTitle, milestoneTitle, description, proofImages string) string {
	return fmt.Sprintf(`
	<html><body style="font-family:Arial,sans-serif;padding:40px">
	<h2>Milestone Achieved!</h2>
	<p>Hello %s,</p>
	<p>The milestone <strong>%s</strong> has been approved for the project <strong>%s</strong>.</p>
	<p>%s</p>
	<h3>Proof Attachments</h3>
	%s
	<hr>
	<p style="color:#888;font-size:12px">Midaas — Invest in Real Businesses</p>
	</body></html>`, fullName, milestoneTitle, projectTitle, description, proofImages)
}

func buildMilestoneRejectedEmail(fullName, projectTitle, milestoneTitle, feedback string) string {
	return fmt.Sprintf(`
	<html><body style="font-family:Arial,sans-serif;padding:40px">
	<h2>Milestone Review Update</h2>
	<p>Hello %s,</p>
	<p>The milestone <strong>%s</strong> for project <strong>%s</strong> was not approved.</p>
	<p><strong>Feedback:</strong> %s</p>
	<p>The entrepreneur has been notified and may resubmit.</p>
	<hr>
	<p style="color:#888;font-size:12px">Midaas — Invest in Real Businesses</p>
	</body></html>`, fullName, milestoneTitle, projectTitle, feedback)
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
