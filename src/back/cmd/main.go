package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/MiltonJ23/Midaas/internal/adapters/email"
	"github.com/MiltonJ23/Midaas/internal/adapters/memory"
	"github.com/MiltonJ23/Midaas/internal/adapters/postgres"
	"github.com/MiltonJ23/Midaas/internal/adapters/storage"
	"github.com/MiltonJ23/Midaas/internal/contracts"
	"github.com/MiltonJ23/Midaas/internal/endpoints/handler"
	"github.com/MiltonJ23/Midaas/internal/endpoints/router"
	"github.com/MiltonJ23/Midaas/internal/logger"
	authsvc 	"github.com/MiltonJ23/Midaas/internal/services/auth"
)

func main() {
	log := logger.New(env("LOG_LEVEL", "debug"))

	objStorage := initStorage(log)
	initEmail(log)

	userRepo, entrepRepo := initRepos(log)

	authService := authsvc.NewAuthService(userRepo, entrepRepo)

	authHandler := handler.NewAuthHandler(authService)
	uploadHandler := handler.NewUploadHandler(objStorage, userRepo)

	apiRouter := router.New(log, authHandler, uploadHandler)

	mux := http.NewServeMux()
	mux.Handle("/", apiRouter)

	port := env("PORT", "8080")
	log.Info("server starting",
		slog.String("port", port),
		slog.String("log_level", env("LOG_LEVEL", "debug")),
	)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Error("server failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func initRepos(log *slog.Logger) (contracts.UserRepository, contracts.EntrepreneurRepository) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn != "" {
		db, err := postgres.NewDB(dsn, log)
		if err != nil {
			log.Warn("postgres: connection failed, falling back to in-memory",
				slog.String("error", err.Error()),
			)
			goto fallback
		}

		if err := postgres.AutoMigrate(db); err != nil {
			log.Warn("postgres: migration failed, falling back to in-memory",
				slog.String("error", err.Error()),
			)
			goto fallback
		}

		log.Info("database: using supabase/postgres")
		return postgres.NewUserRepository(db), postgres.NewEntrepreneurRepository(db)
	}

fallback:
	log.Info("database: using in-memory (set DATABASE_URL for postgres)")
	return memory.NewUserRepository(), memory.NewEntrepreneurRepository()
}

func initStorage(log *slog.Logger) contracts.ObjectStorageService {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName != "" && apiKey != "" && apiSecret != "" {
		store, err := storage.NewCloudinaryStorage(cloudName, apiKey, apiSecret)
		if err != nil {
			log.Warn("cloudinary: init failed, falling back to local storage",
				slog.String("error", err.Error()),
			)
		} else {
			log.Info("storage: using cloudinary",
				slog.String("cloud_name", cloudName),
			)
			return store
		}
	}

	uploadPath := env("UPLOAD_PATH", "./uploads")
	log.Info("storage: using local filesystem",
		slog.String("path", uploadPath),
	)
	return storage.NewLocalStorage(
		uploadPath,
		env("UPLOAD_BASE_URL", "http://localhost:8080/uploads"),
	)
}

func initEmail(log *slog.Logger) contracts.EmailService {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	if host != "" && username != "" && password != "" {
		if port == "" {
			port = "587"
		}
		if from == "" {
			from = "noreply@midaas.com"
		}
		log.Info("email: using SMTP",
			slog.String("host", host),
			slog.String("from", from),
		)
		return email.NewSMTPAdapter(email.SMTPConfig{
			Host:     host,
			Port:     port,
			Username: username,
			Password: password,
			From:     from,
		})
	}

	log.Info("email: using log adapter (set SMTP_HOST to send real emails)")
	return email.NewLogAdapter()
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
