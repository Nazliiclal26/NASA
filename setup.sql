CREATE DATABASE movies;
\c movies
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  group_code VARCHAR(10) NOT NULL
);