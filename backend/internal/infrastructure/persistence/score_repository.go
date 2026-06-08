package persistence

import (
	"context"
	"fmt"

	"github.com/Kumoichi/typing-game/backend/internal/domain"
	"github.com/jmoiron/sqlx"
)

type ScoreRepository struct {
	db *sqlx.DB
}

func NewScoreRepository(db *sqlx.DB) *ScoreRepository {
	return &ScoreRepository{db: db}
}

func (r *ScoreRepository) ListTop(ctx context.Context, limit int) ([]domain.Score, error) {
	var scores []domain.Score
	err := r.db.SelectContext(ctx, &scores, `
		SELECT id, wpm, accuracy, created_at
		FROM scores
		ORDER BY wpm DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("select top scores: %w", err)
	}
	return scores, nil
}

func (r *ScoreRepository) Create(ctx context.Context, score domain.Score) (*domain.Score, error) {
	var created domain.Score
	err := r.db.QueryRowxContext(ctx, `
		INSERT INTO scores (wpm, accuracy)
		VALUES ($1, $2)
		RETURNING id, wpm, accuracy, created_at
	`, score.WPM, score.Accuracy).StructScan(&created)
	if err != nil {
		return nil, fmt.Errorf("insert score: %w", err)
	}
	return &created, nil
}
