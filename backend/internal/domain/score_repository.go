package domain

import "context"

type ScoreRepository interface {
	ListTop(ctx context.Context, limit int) ([]Score, error)
	Create(ctx context.Context, score Score) (*Score, error)
}
