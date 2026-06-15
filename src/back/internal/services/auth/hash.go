package auth

import (
	"crypto/subtle"

	"golang.org/x/crypto/bcrypt"
)

var dummyHash []byte

func init() {
	dummyHash, _ = bcrypt.GenerateFromPassword(
		[]byte("midaas_dummy_hash_v1_constant_precomputed_32"),
		bcrypt.DefaultCost,
	)
}

type PasswordHasher struct {
	cost int
}

func NewPasswordHasher() *PasswordHasher {
	return &PasswordHasher{cost: bcrypt.DefaultCost}
}

func (h *PasswordHasher) Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func (h *PasswordHasher) Compare(hashed, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))
}

func (h *PasswordHasher) DummyCompare() {
	subtle.ConstantTimeCompare(dummyHash, dummyHash)
}
