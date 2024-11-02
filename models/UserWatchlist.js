// models/UserWatchlist.js
const pool = require('../config/db');

const UserWatchlist = {
    addItem: async (userId, itemId, itemType) => {
        const result = await pool.query(
            `INSERT INTO user_watchlists (user_id, item_id, item_type) 
             VALUES ($1, $2, $3) RETURNING *`,
            [userId, itemId, itemType]
        );
        return result.rows[0];
    },
    findByUserId: async (userId) => {
        const result = await pool.query(`SELECT * FROM user_watchlists WHERE user_id = $1`, [userId]);
        return result.rows;
    },
    removeItem: async (id) => {
        await pool.query(`DELETE FROM user_watchlists WHERE id = $1`, [id]);
    }
};

module.exports = UserWatchlist;
