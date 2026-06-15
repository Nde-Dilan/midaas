package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/MiltonJ23/Midaas/internal/contracts"
)

type BrevoConfig struct {
	APIKey string
	From   string
}

type brevoAdapter struct {
	config BrevoConfig
	client *http.Client
}

func NewBrevoAdapter(config BrevoConfig) contracts.EmailService {
	return &brevoAdapter{
		config: config,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

type brevoPayload struct {
	Sender      brevoRecipient   `json:"sender"`
	To          []brevoRecipient `json:"to"`
	Subject     string           `json:"subject"`
	HTMLContent string           `json:"htmlContent"`
}

type brevoRecipient struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

func (a *brevoAdapter) Send(ctx context.Context, msg contracts.EmailMessage) error {
	to := make([]brevoRecipient, len(msg.To))
	for i, addr := range msg.To {
		to[i] = brevoRecipient{Email: addr}
	}

	payload := brevoPayload{
		Sender:      brevoRecipient{Email: a.config.From, Name: "Midaas"},
		To:          to,
		Subject:     msg.Subject,
		HTMLContent: msg.HTML,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("brevo: marshal: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx,
		"POST", "https://api.brevo.com/v3/smtp/email", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("brevo: request: %w", err)
	}

	req.Header.Set("api-key", a.config.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return fmt.Errorf("brevo: send: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("brevo: API error %d", resp.StatusCode)
	}

	return nil
}
