package application

import (
	"context"
	"errors"

	"github.com/Kumoichi/typing-game/backend/internal/domain"
)

var ErrInvalidScore = errors.New("invalid score data")

type ScoreUseCase struct {
	repository domain.ScoreRepository
}

func NewScoreUseCase(repository domain.ScoreRepository) *ScoreUseCase {
	return &ScoreUseCase{repository: repository}
}

func (u *ScoreUseCase) GetTopScores(ctx context.Context, limit int) ([]domain.Score, error) {
	if limit <= 0 {
		limit = 10
	}
	return u.repository.ListTop(ctx, limit)
}

func (u *ScoreUseCase) CreateScore(ctx context.Context, score domain.Score) (*domain.Score, error) {
	if score.WPM < 0 || score.Accuracy < 0 || score.Accuracy > 100 {
		return nil, ErrInvalidScore
	}
	return u.repository.Create(ctx, score)
}
