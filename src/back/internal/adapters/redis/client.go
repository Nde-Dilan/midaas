package redis

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func NewClient(publicURL, password string) (*redis.Client, error) {
	opts, err := redis.ParseURL(publicURL)
	if err != nil {
		return nil, fmt.Errorf("redis: parse url: %w", err)
	}
	if password != "" {
		opts.Password = password
	}
	client := redis.NewClient(opts)

	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("redis: ping: %w", err)
	}
	return client, nil
}
