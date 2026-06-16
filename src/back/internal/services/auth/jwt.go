package auth

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type TokenClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
	Role  string `json:"role,omitempty"`
}

type JWTService struct {
	secret []byte
	ttl    time.Duration
}

func NewJWTService() *JWTService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "midaas_dev_secret_change_in_production"
	}
	return &JWTService{
		secret: []byte(secret),
		ttl:    24 * time.Hour,
	}
}

func NewJWTServiceWithSecret(secret string) *JWTService {
	return &JWTService{
		secret: []byte(secret),
		ttl:    24 * time.Hour,
	}
}

func (s *JWTService) Issue(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.ttl)),
			Issuer:    "midaas",
		},
		Email: email,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *JWTService) Validate(tokenString string) (uuid.UUID, string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.secret, nil
		},
	)
	if err != nil {
		return uuid.Nil, "", fmt.Errorf("jwt parse: %w", err)
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok || !token.Valid {
		return uuid.Nil, "", fmt.Errorf("invalid token claims")
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return uuid.Nil, "", fmt.Errorf("invalid user id in token: %w", err)
	}

	return userID, claims.Email, nil
}

func (s *JWTService) IssueForAdmin(adminID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   adminID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.ttl)),
			Issuer:    "midaas-admin",
		},
		Email: email,
		Role:  "admin",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *JWTService) ValidateAdmin(tokenString string) (uuid.UUID, error) {
	userID, email, err := s.Validate(tokenString)
	if err != nil {
		return uuid.Nil, err
	}

	token, _ := jwt.ParseWithClaims(tokenString, &TokenClaims{},
		func(token *jwt.Token) (interface{}, error) { return s.secret, nil },
	)
	if claims, ok := token.Claims.(*TokenClaims); ok && claims.Role == "admin" {
		return userID, nil
	}

	_ = email
	return uuid.Nil, fmt.Errorf("not an admin token")
}
