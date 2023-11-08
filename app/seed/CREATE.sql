DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(255) NOT NULL,
    password   CHAR(60)     NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS words;
CREATE TABLE words
(
    id   SERIAL PRIMARY KEY,
    word CHAR(5) NOT NULL
);

DROP TABLE IF EXISTS games;
CREATE TABLE games
(
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users (id),
    word_id           INTEGER NOT NULL REFERENCES words (id),
    guessed_correctly BOOLEAN   DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW()
)


