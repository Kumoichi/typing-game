package domain

import "time"

type Score struct {
	ID        int       `db:"id" json:"id"`
	WPM       int       `db:"wpm" json:"wpm"`
	Accuracy  float64   `db:"accuracy" json:"accuracy"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}
