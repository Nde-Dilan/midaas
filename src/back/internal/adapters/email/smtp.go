package email

import (
	"context"
	"fmt"
	"net/smtp"
	"strings"

	"github.com/MiltonJ23/Midaas/internal/contracts"
)

type SMTPConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

type smtpAdapter struct {
	config SMTPConfig
}

func NewSMTPAdapter(config SMTPConfig) contracts.EmailService {
	return &smtpAdapter{config: config}
}

func (a *smtpAdapter) Send(ctx context.Context, msg contracts.EmailMessage) error {
	auth := smtp.PlainAuth("", a.config.Username, a.config.Password, a.config.Host)

	to := strings.Join(msg.To, ", ")

	body := buildMIME(msg.Subject, to, a.config.From, msg.HTML)

	addr := fmt.Sprintf("%s:%s", a.config.Host, a.config.Port)
	return smtp.SendMail(addr, auth, a.config.From, msg.To, []byte(body))
}

func buildMIME(subject, to, from, html string) string {
	return fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"MIME-Version: 1.0\r\n"+
		"Content-Type: text/html; charset=UTF-8\r\n"+
		"\r\n"+
		"%s", from, to, subject, html)
}
