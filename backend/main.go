package main

import (
	"embed"
	"log"
	"net/http"
	"os"

	"github.com/Kumoichi/typing-game/backend/internal/application"
	"github.com/Kumoichi/typing-game/backend/internal/db"
	"github.com/Kumoichi/typing-game/backend/internal/handler"
	"github.com/Kumoichi/typing-game/backend/internal/infrastructure/persistence"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

//go:embed sql/migrations/*.sql
var migrations embed.FS

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is required")
	}

	database, err := db.New(dsn, migrations)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	scoreRepo := persistence.NewScoreRepository(database.DB)
	scoreUseCase := application.NewScoreUseCase(scoreRepo)
	h := handler.New(scoreUseCase)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Content-Type"},
	}))

	r.Get("/api/scores", h.GetScores)
	r.Post("/api/scores", h.CreateScore)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
