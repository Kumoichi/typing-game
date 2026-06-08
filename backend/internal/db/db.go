package db

import (
	"database/sql"
	"io/fs"

	"github.com/jmoiron/sqlx"
	"github.com/pressly/goose/v3"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type DB struct {
	*sqlx.DB
}

func New(dsn string, migrations fs.FS) (*DB, error) {
	db, err := sqlx.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	if err := migrate(db.DB, migrations); err != nil {
		return nil, err
	}

	return &DB{db}, nil
}

func migrate(db *sql.DB, migrations fs.FS) error {
	goose.SetBaseFS(migrations)
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}
	return goose.Up(db, "sql/migrations")
}
