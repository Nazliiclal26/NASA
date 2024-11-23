DROP DATABASE IF EXISTS book_film_club;
CREATE database book_film_club;
\c book_film_club;

-- Create a dedicated PostgreSQL user for the book club project
CREATE USER book_club_user WITH PASSWORD 'your_password';

-- Grant all privileges on the database to the new user
GRANT ALL PRIVILEGES ON DATABASE book_film_club TO book_club_user;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    preferred_genres VARCHAR(255)[]
);

-- User Watchlist Table
CREATE TABLE IF NOT EXISTS user_watchlists (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    poster TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Watchlist Table
CREATE TABLE IF NOT EXISTS group_watchlists (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(255),
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    poster TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) UNIQUE NOT NULL,
    secret_code VARCHAR(255) NOT NULL,
    leader_id INT REFERENCES users(id) ON DELETE SET NULL,
    group_type VARCHAR(10) NOT NULL CHECK (group_type IN ('book', 'movie')),
    privacy VARCHAR(10) NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
    members VARCHAR(255)[],
    voting_status BOOLEAN DEFAULT FALSE
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    group_code VARCHAR(10) NOT NULL,  
    film_title VARCHAR(255), 
    book_title VARCHAR(255),
    num_votes INTEGER DEFAULT 1,
    poster VARCHAR(255) NOT NULL,
    film_genre VARCHAR(255),
    user_id INTEGER
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) NOT NULL,
    sender_id INT REFERENCES users(id) NOT NULL,
    user_message VARCHAR(512) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Group Calendar Events Table
CREATE TABLE group_events (
    event_id SERIAL PRIMARY KEY,
    group_code VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    description TEXT
);


GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO book_club_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO book_club_user;
