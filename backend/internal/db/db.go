package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
}

func New(path string) (*DB, error) {
	conn, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	if err := migrate(conn); err != nil {
		return nil, err
	}

	return &DB{conn}, nil
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS scores (
			id         INTEGER PRIMARY KEY AUTOINCREMENT,
			wpm        INTEGER NOT NULL,
			accuracy   REAL NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	return err
}
