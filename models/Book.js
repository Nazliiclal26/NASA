// models/Book.js
const pool = require('../config/db');

const Book = {
    // Create a new book entry
    create: async (title, author, genre, coverUrl, rating) => {
        const result = await pool.query(
            `INSERT INTO books (title, author, genre, cover_url, rating) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, author, genre, coverUrl, rating]
        );
        return result.rows[0];
    },

    // Find a book by its ID
    findById: async (id) => {
        const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Search for books by title or genre
    search: async (query) => {
        const result = await pool.query(
            `SELECT * FROM books WHERE title ILIKE $1 OR genre ILIKE $1`,
            [`%${query}%`]
        );
        return result.rows;
    }
};

module.exports = Book;
