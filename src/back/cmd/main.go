package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/MiltonJ23/Midaas/internal/adapters/email"
	"github.com/MiltonJ23/Midaas/internal/adapters/postgres"
	"github.com/MiltonJ23/Midaas/internal/adapters/storage"
	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/endpoints/handler"
	"github.com/MiltonJ23/Midaas/internal/endpoints/router"
	"github.com/MiltonJ23/Midaas/internal/logger"
	authsvc "github.com/MiltonJ23/Midaas/internal/services/auth"
	notifsvc "github.com/MiltonJ23/Midaas/internal/services/notification"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()
	log := logger.New(require("LOG_LEVEL"))

	db := initDB(log)
	objStorage := initStorage(log)
	emailSvc := initEmail(log)

	userRepo := postgres.NewUserRepository(db)
	entrepRepo := postgres.NewEntrepreneurRepository(db)

	authService := authsvc.NewAuthService(userRepo, entrepRepo)

	notifSvc := notifsvc.NewNotificationService(
		emailSvc,
		postgres.NewMilestoneRepository(db),
		postgres.NewProjectRepository(db),
		postgres.NewInvestmentRepository(db),
		postgres.NewUserRepository(db),
		requireOr("SMTP_FROM", "noreply@midaas.com"),
	)

	authHandler := handler.NewAuthHandler(authService, notifSvc)
	uploadHandler := handler.NewUploadHandler(objStorage, userRepo)

	apiRouter := router.New(log, authHandler, uploadHandler)

	mux := http.NewServeMux()
	mux.Handle("/", apiRouter)

	port := requireOr("PORT", "8080")
	log.Info("server ready", slog.String("port", port))

	srv := &http.Server{Addr: ":" + port, Handler: mux}
	if err := srv.ListenAndServe(); err != nil {
		log.Error("server failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func initDB(log *slog.Logger) *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		panic("DATABASE_URL is required")
	}
	db, err := postgres.NewDB(dsn, log)
	if err != nil {
		panic("postgres: " + err.Error())
	}
	if err := postgres.AutoMigrate(db, log); err != nil {
		panic("migrate: " + err.Error())
	}
	log.Info("database: connected")
	return db
}

func initStorage(log *slog.Logger) contracts.ObjectStorageService {
	store, err := storage.NewCloudinaryStorage(
		require("CLOUDINARY_CLOUD_NAME"),
		require("CLOUDINARY_API_KEY"),
		require("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		panic("cloudinary: " + err.Error())
	}
	log.Info("storage: cloudinary")
	return store
}

func initEmail(log *slog.Logger) contracts.EmailService {
	cfg := email.BrevoConfig{
		APIKey: require("BREVO_API_KEY"),
		From:   requireOr("SMTP_FROM", "noreply@midaas.com"),
	}
	log.Info("email: Brevo API configured")
	return email.NewBrevoAdapter(cfg)
}

func require(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic("Missing required env var: " + key)
	}
	return v
}

func requireOr(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}
