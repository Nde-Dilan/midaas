package pawapay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	BaseURL string
	Token   string
}

type Client struct {
	config Config
	http   *http.Client
}

func New(config Config) *Client {
	return &Client{
		config: config,
		http:   &http.Client{Timeout: 15 * time.Second},
	}
}

type DepositRequest struct {
	DepositID       string `json:"depositId"`
	Amount          string `json:"amount"`
	Currency        string `json:"currency"`
	CustomerMessage string `json:"customerMessage,omitempty"`
	Payer           struct {
		Type           string `json:"type"`
		AccountDetails struct {
			PhoneNumber string `json:"phoneNumber"`
			Provider    string `json:"provider"`
		} `json:"accountDetails"`
	} `json:"payer"`
}

type DepositResponse struct {
	DepositID     string         `json:"depositId"`
	Status        string         `json:"status"`
	FailureReason *FailureReason `json:"failureReason,omitempty"`
}

type StatusResponse struct {
	Status string         `json:"status"`
	Data   *DepositResponse `json:"data,omitempty"`
}

type FailureReason struct {
	FailureCode    string `json:"failureCode"`
	FailureMessage string `json:"failureMessage"`
}

type PayoutRequest struct {
	PayoutID        string `json:"payoutId"`
	Amount          string `json:"amount"`
	Currency        string `json:"currency"`
	CustomerMessage string `json:"customerMessage,omitempty"`
	Recipient       struct {
		Type           string `json:"type"`
		AccountDetails struct {
			PhoneNumber string `json:"phoneNumber"`
			Provider    string `json:"provider"`
		} `json:"accountDetails"`
	} `json:"recipient"`
}

type RefundRequest struct {
	RefundID  string `json:"refundId"`
	DepositID string `json:"depositId"`
	Amount    string `json:"amount,omitempty"`
	Currency  string `json:"currency,omitempty"`
}

func (c *Client) InitiateDeposit(ctx context.Context, req DepositRequest) (*DepositResponse, error) {
	body, _ := json.Marshal(req)
	r, err := c.do(ctx, "POST", "/v2/deposits", body)
	if err != nil {
		return nil, err
	}
	var resp DepositResponse
	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		return nil, fmt.Errorf("pawapay: decode: %w", err)
	}
	return &resp, nil
}

func (c *Client) CheckDepositStatus(ctx context.Context, depositID string) (*StatusResponse, error) {
	r, err := c.do(ctx, "GET", "/v2/deposits/"+depositID, nil)
	if err != nil {
		return nil, err
	}
	var resp StatusResponse
	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		return nil, fmt.Errorf("pawapay: decode: %w", err)
	}
	return &resp, nil
}

func (c *Client) InitiatePayout(ctx context.Context, req PayoutRequest) (*DepositResponse, error) {
	body, _ := json.Marshal(req)
	r, err := c.do(ctx, "POST", "/v2/payouts", body)
	if err != nil {
		return nil, err
	}
	var resp DepositResponse
	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		return nil, fmt.Errorf("pawapay: decode: %w", err)
	}
	return &resp, nil
}

func (c *Client) InitiateRefund(ctx context.Context, req RefundRequest) (*DepositResponse, error) {
	body, _ := json.Marshal(req)
	r, err := c.do(ctx, "POST", "/v2/refunds", body)
	if err != nil {
		return nil, err
	}
	var resp DepositResponse
	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		return nil, fmt.Errorf("pawapay: decode: %w", err)
	}
	return &resp, nil
}

func (c *Client) do(ctx context.Context, method, path string, body []byte) (*http.Response, error) {
	url := c.config.BaseURL + path
	req, err := http.NewRequestWithContext(ctx, method, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("pawapay: request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.config.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("pawapay: do: %w", err)
	}
	if resp.StatusCode >= 400 {
		var errResp struct {
			FailureReason FailureReason `json:"failureReason"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		resp.Body.Close()
		return nil, fmt.Errorf("pawapay: %s: %s", errResp.FailureReason.FailureCode, errResp.FailureReason.FailureMessage)
	}
	return resp, nil
}
