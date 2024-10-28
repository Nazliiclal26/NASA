// models/Watchlist.js
const pool = require('../config/db');

const Watchlist = {
    // Add a book or movie to a watchlist
    addItem: async (userId, groupId, bookId, movieId) => {
        const result = await pool.query(
            `INSERT INTO watchlists (user_id, group_id, book_id, movie_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, groupId, bookId, movieId]
        );
        return result.rows[0];
    },

    // Get watchlist items for a user or group
    findByUserIdOrGroupId: async (userId, groupId) => {
        const result = await pool.query(
            `SELECT * FROM watchlists WHERE user_id = $1 OR group_id = $2`,
            [userId, groupId]
        );
        return result.rows;
    },

    // Remove an item from a watchlist
    removeItem: async (id) => {
        await pool.query('DELETE FROM watchlists WHERE id = $1', [id]);
    }
};

module.exports = Watchlist;
