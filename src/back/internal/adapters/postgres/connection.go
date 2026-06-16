package postgres

import (
	"fmt"
	"log/slog"

	"github.com/MiltonJ23/Midaas/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func NewDB(dsn string, log *slog.Logger) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("postgres: connect: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("postgres: get sql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)

	log.Info("postgres: connected")
	return db, nil
}

func AutoMigrate(db *gorm.DB, log *slog.Logger) error {
	log.Info("postgres: running auto-migrate (adding missing columns)")
	return db.AutoMigrate(
		&domain.User{},
		&domain.Entrepreneur{},
		&domain.Admin{},
		&domain.Company{},
		&domain.CompanyLegalDocs{},
		&domain.CompanyFinancials{},
		&domain.BeneficialOwner{},
		&domain.CompanyManager{},
		&domain.CompanyOperations{},
		&domain.Project{},
		&domain.Milestone{},
		&domain.Investment{},
		&domain.Transaction{},
	)
}
