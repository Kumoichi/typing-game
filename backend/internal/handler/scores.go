package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Kumoichi/typing-game/backend/internal/db"
)

type Handler struct {
	db *db.DB
}

func New(db *db.DB) *Handler {
	return &Handler{db: db}
}

type Score struct {
	ID        int       `json:"id"`
	WPM       int       `json:"wpm"`
	Accuracy  float64   `json:"accuracy"`
	CreatedAt time.Time `json:"createdAt"`
}

func (h *Handler) GetScores(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(`
		SELECT id, wpm, accuracy, created_at
		FROM scores
		ORDER BY wpm DESC
		LIMIT 10
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	scores := []Score{}
	for rows.Next() {
		var s Score
		if err := rows.Scan(&s.ID, &s.WPM, &s.Accuracy, &s.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		scores = append(scores, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scores)
}

type createScoreRequest struct {
	WPM      int     `json:"wpm"`
	Accuracy float64 `json:"accuracy"`
}

func (h *Handler) CreateScore(w http.ResponseWriter, r *http.Request) {
	var req createScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var score Score
	err := h.db.QueryRow(`
		INSERT INTO scores (wpm, accuracy) VALUES (?, ?)
		RETURNING id, wpm, accuracy, created_at
	`, req.WPM, req.Accuracy).Scan(&score.ID, &score.WPM, &score.Accuracy, &score.CreatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(score)
}
