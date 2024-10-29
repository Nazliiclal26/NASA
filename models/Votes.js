// models/Votes.js
const pool = require('../config/db');

const Votes = {
    // Cast a vote for a book or movie
    castVote: async (userId, groupId, itemId, itemType) => {
        const result = await pool.query(
            `INSERT INTO votes (user_id, group_id, item_id, item_type) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, groupId, itemId, itemType]
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
    },

    // Remove a specific vote
    removeVote: async (id) => {
        await pool.query(`DELETE FROM votes WHERE id = $1`, [id]);
    },
    
    // Count votes for a specific item within a group
    countVotesForItem: async (groupId, itemId) => {
        const result = await pool.query(
            `SELECT COUNT(*) FROM votes WHERE group_id = $1 AND item_id = $2`,
            [groupId, itemId]
        );
        return parseInt(result.rows[0].count, 10);
    }
};

module.exports = Votes;
