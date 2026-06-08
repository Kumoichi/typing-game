-- +goose Up
CREATE TABLE scores (
    id         SERIAL PRIMARY KEY,
    wpm        INTEGER NOT NULL,
    accuracy   REAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE scores;
