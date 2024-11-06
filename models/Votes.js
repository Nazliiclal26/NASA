// models/Votes.js
const pool = require('../config/db');

const Votes = {
    // Cast a vote for a film in a specific group
    castVote: async (groupCode, filmTitle) => {
        const result = await pool.query(
            `INSERT INTO votes (group_code, film_title, votes) 
             VALUES ($1, $2, 1) 
             ON CONFLICT (group_code, film_title) 
             DO UPDATE SET votes = votes.num_votes + 1 
             RETURNING *`,
            [groupCode, filmTitle]
        );
        return result.rows[0];
    },

    // Retrieve votes for a specific group and film title
    getVotesByGroupAndTitle: async (groupCode, filmTitle) => {
        const result = await pool.query(
            `SELECT votes FROM votes 
             WHERE group_code = $1 AND film_title = $2`,
            [groupCode, filmTitle]
        );
        return result.rows.length ? result.rows[0].votes : 0;
    },

    // Retrieve all votes for a specific group
    getVotesByGroup: async (groupCode) => {
        const result = await pool.query(
            `SELECT film_title, votes FROM votes 
             WHERE group_code = $1 ORDER BY votes DESC`,
            [groupCode]
        );
        return result.rows;
    },

    // Get all votes for a group
    findByGroupId: async (groupId) => {
        const result = await pool.query(
            `SELECT * FROM votes WHERE group_id = $1`,
            [groupId]
        );
        return result.rows;
    },

    // Remove a specific vote
    removeVote: async (id) => {
        await pool.query(`DELETE FROM votes WHERE id = $1`, [id]);
    }
};

module.exports = Votes;
