package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"

	"github.com/MiltonJ23/Midaas/internal/adapters/email"
	"github.com/MiltonJ23/Midaas/internal/adapters/postgres"
	redisadapter "github.com/MiltonJ23/Midaas/internal/adapters/redis"
	"github.com/MiltonJ23/Midaas/internal/adapters/storage"
	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/domain"
	"github.com/MiltonJ23/Midaas/internal/endpoints/handler"
	"github.com/MiltonJ23/Midaas/internal/endpoints/router"
	"github.com/MiltonJ23/Midaas/internal/logger"
	adminsvc "github.com/MiltonJ23/Midaas/internal/services/admin"
	authsvc "github.com/MiltonJ23/Midaas/internal/services/auth"
	notifsvc "github.com/MiltonJ23/Midaas/internal/services/notification"
	"github.com/MiltonJ23/Midaas/internal/services/worker"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()
	log := logger.New(require("LOG_LEVEL"))

	db := initDB(log)
	objStorage := initStorage(log)
	emailSvc := initEmail(log)
	rdb := initRedis(log)

	userRepo := postgres.NewUserRepository(db)
	entrepRepo := postgres.NewEntrepreneurRepository(db)
	companyRepo := postgres.NewCompanyRepository(db)
	adminRepo := postgres.NewAdminRepository(db)
	projectRepo := postgres.NewProjectRepository(db)
	milestoneRepo := postgres.NewMilestoneRepository(db)
	investmentRepo := postgres.NewInvestmentRepository(db)
	transactionRepo := postgres.NewTransactionRepository(db)

	authService := authsvc.NewAuthService(userRepo, entrepRepo)

	notifSvc := notifsvc.NewNotificationService(
		emailSvc, milestoneRepo, projectRepo, investmentRepo, userRepo,
		requireOr("SMTP_FROM", "noreply@midaas.com"),
	)

	adminService := adminsvc.NewAdminService(adminRepo, companyRepo, entrepRepo, userRepo)

	authHandler := handler.NewAuthHandler(authService, notifSvc)
	uploadHandler := handler.NewUploadHandler(objStorage, userRepo)
	companyHandler := handler.NewCompanyHandler(companyRepo, entrepRepo, objStorage)
	adminHandler := handler.NewAdminHandler(adminService, adminRepo, userRepo, entrepRepo, companyRepo, projectRepo, milestoneRepo, notifSvc)
	projectHandler := handler.NewProjectHandler(projectRepo, milestoneRepo, investmentRepo, transactionRepo, companyRepo, entrepRepo, userRepo, objStorage, notifSvc)
	investmentHandler := handler.NewInvestmentHandler(investmentRepo, projectRepo, userRepo, notifSvc)

	seedAdmin(log, adminRepo, authsvc.NewPasswordHasher())
	worker.StartAutoCancel(projectRepo, investmentRepo, transactionRepo, log)

	apiRouter := router.New(log, authHandler, uploadHandler, companyHandler, adminHandler, projectHandler, investmentHandler, entrepRepo)

	mux := http.NewServeMux()
	mux.Handle("/", apiRouter)

	port := requireOr("PORT", "8080")
	log.Info("server ready", slog.String("port", port), slog.Bool("redis", rdb != nil))

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

func initRedis(log *slog.Logger) *redis.Client {
	url := os.Getenv("REDIS_PUBLIC_URL")
	pass := os.Getenv("REDIS_PASSWORD")
	if url == "" {
		log.Warn("redis: REDIS_PUBLIC_URL not set, skipping")
		return nil
	}
	client, err := redisadapter.NewClient(url, pass)
	if err != nil {
		log.Warn("redis: failed to connect", slog.String("error", err.Error()))
		return nil
	}
	log.Info("redis: connected")
	return client
}

func seedAdmin(log *slog.Logger, adminRepo contracts.AdminRepository, hasher *authsvc.PasswordHasher) {
	email := os.Getenv("ADMIN_EMAIL")
	password := os.Getenv("ADMIN_PASSWORD")
	if email == "" || password == "" {
		log.Info("admin: no ADMIN_EMAIL/ADMIN_PASSWORD set, skipping seed")
		return
	}

	ctx := context.Background()
	_, err := adminRepo.FindByEmail(ctx, email)
	if err == nil {
		log.Info("admin: already exists", slog.String("email", email))
		return
	}

	hashed, err := hasher.Hash(password)
	if err != nil {
		log.Error("admin: seed failed", slog.String("error", err.Error()))
		return
	}

	admin := &domain.Admin{
		ID:           uuid.New(),
		Email:        email,
		HashPassword: hashed,
		FullName:     "Admin",
		Role:         domain.AdminRoleSuperAdmin,
	}

	if err := adminRepo.Create(ctx, admin); err != nil {
		log.Error("admin: seed failed", slog.String("error", err.Error()))
		return
	}

	log.Info("admin: seeded", slog.String("email", email))
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
