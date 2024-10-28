// models/Votes.js
const pool = require('../config/db');

const Votes = {
    // Cast a vote for a book or movie
    castVote: async (userId, groupId, bookId, movieId) => {
        const result = await pool.query(
            `INSERT INTO votes (user_id, group_id, book_id, movie_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, groupId, bookId, movieId]
        );
        return result.rows[0];
    },

    // Get all votes for a group
    findByGroupId: async (groupId) => {
        const result = await pool.query(
            `SELECT * FROM votes WHERE group_id = $1`,
            [groupId]
        );
        return result.rows;
    }
};

module.exports = Votes;
