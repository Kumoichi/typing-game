package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Kumoichi/typing-game/backend/internal/application"
	"github.com/Kumoichi/typing-game/backend/internal/domain"
)

type Handler struct {
	scoreUseCase *application.ScoreUseCase
}

func New(scoreUseCase *application.ScoreUseCase) *Handler {
	return &Handler{scoreUseCase: scoreUseCase}
}

func (h *Handler) GetScores(w http.ResponseWriter, r *http.Request) {
	scores, err := h.scoreUseCase.GetTopScores(r.Context(), 10)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
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

	created, err := h.scoreUseCase.CreateScore(r.Context(), domain.Score{
		WPM:      req.WPM,
		Accuracy: req.Accuracy,
	})
	if err != nil {
		if err == application.ErrInvalidScore {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}
