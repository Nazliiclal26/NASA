// models/GroupWatchlist.js
const pool = require('../config/db');

const GroupWatchlist = {
    addItem: async (groupId, itemId, itemType) => {
        const result = await pool.query(
            `INSERT INTO group_watchlists (group_id, item_id, item_type) 
             VALUES ($1, $2, $3) RETURNING *`,
            [groupId, itemId, itemType]
        );
        return result.rows[0];
    },
    findByGroupId: async (groupId) => {
        const result = await pool.query(`SELECT * FROM group_watchlists WHERE group_id = $1`, [groupId]);
        return result.rows;
    },
    removeItem: async (id) => {
        await pool.query(`DELETE FROM group_watchlists WHERE id = $1`, [id]);
    }
};

module.exports = GroupWatchlist;
