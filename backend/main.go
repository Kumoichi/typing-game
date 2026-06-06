package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/Kumoichi/typing-game/backend/internal/db"
	"github.com/Kumoichi/typing-game/backend/internal/handler"
)

func main() {
	database, err := db.New("./scores.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	h := handler.New(database)

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
