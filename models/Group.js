// models/Group.js
const pool = require('../config/db');

const Group = {
    // Create a new group
    create: async (groupName, leaderId) => {
        const result = await pool.query(
            `INSERT INTO groups (group_name, leader_id) 
             VALUES ($1, $2) RETURNING *`,
            [groupName, leaderId]
        );
        return result.rows[0];
    },

    // Find a group by its ID
    findById: async (id) => {
        const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Get all groups a user is part of
    findByUserId: async (userId) => {
        const result = await pool.query(
            `SELECT groups.* FROM groups
             JOIN group_members ON groups.id = group_members.group_id
             WHERE group_members.user_id = $1`,
            [userId]
        );
        return result.rows;
    }
};

module.exports = Group;
