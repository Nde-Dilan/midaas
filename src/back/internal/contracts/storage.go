package contracts

import (
	"context"
	"io"
	"time"
)

type UploadInput struct {
	Key         string
	Body        io.Reader
	ContentType string
	Size        int64
	Public      bool
}

type UploadResult struct {
	URL string
	Key string
}

type ObjectStorageService interface {
	Upload(ctx context.Context, input UploadInput) (*UploadResult, error)
	UploadMultiple(ctx context.Context, inputs []UploadInput) ([]UploadResult, error)
	Delete(ctx context.Context, key string) error
	GetSignedURL(ctx context.Context, key string, expiry time.Duration) (string, error)
}
