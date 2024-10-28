// models/Movie.js
const pool = require('../config/db');

const Movie = {
    // Create a new movie entry
    create: async (title, director, genre, coverUrl, rating, releaseYear) => {
        const result = await pool.query(
            `INSERT INTO movies (title, director, genre, cover_url, rating, release_year) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, director, genre, coverUrl, rating, releaseYear]
        );
        return result.rows[0];
    },

    // Find a movie by its ID
    findById: async (id) => {
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Search for movies by title or genre
    search: async (query) => {
        const result = await pool.query(
            `SELECT * FROM movies WHERE title ILIKE $1 OR genre ILIKE $1`,
            [`%${query}%`]
        );
        return result.rows;
    }
};

module.exports = Movie;
