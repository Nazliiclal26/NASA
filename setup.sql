DROP DATABASE IF EXISTS book_film_club;
CREATE database book_film_club;
\c book_film_club;
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    preferred_genres VARCHAR(255)[]
);

-- User Watchlist Table
CREATE TABLE IF NOT EXISTS user_watchlists (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Watchlist Table
CREATE TABLE IF NOT EXISTS group_watchlists (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    leader_id INT REFERENCES users(id) ON DELETE SET NULL,
    group_type VARCHAR(10) NOT NULL CHECK (group_type IN ('book', 'movie'))
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL, -- API reference ID (Google Books or OMDb ID)
    item_type VARCHAR(50) NOT NULL, -- 'book' or 'movie'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);