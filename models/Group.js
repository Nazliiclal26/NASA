// models/Group.js
const pool = require('../config/db');

const Group = {
    // Create a new group
    create: async (groupName, leaderId, groupType) => {
        if (!['book', 'movie'].includes(groupType)) {
            throw new Error("groupType must be either 'book' or 'movie'");
        }

        const result = await pool.query(
            `INSERT INTO groups (group_name, leader_id, group_type) 
             VALUES ($1, $2, $3) RETURNING *`,
            [groupName, leaderId, groupType]
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
    },

    // Update group leader
    updateLeader: async (groupId, newLeaderId) => {
        const result = await pool.query(
            `UPDATE groups SET leader_id = $1 WHERE id = $2 RETURNING *`,
            [newLeaderId, groupId]
        );
        return result.rows[0];
    },
    
    // Find all book or movie groups
    findByType: async (groupType) => {
        if (!['book', 'movie'].includes(groupType)) {
            throw new Error("groupType must be either 'book' or 'movie'");
        }
    
        const result = await pool.query(
            `SELECT * FROM groups WHERE group_type = $1`,
            [groupType]
        );
        return result.rows;
    },

    // Find singular group row by its name
    findByName: async (groupName) => {
        if (!groupName) {
            throw new Error("Must include group name in request.");
        }

        const result = await pool.query(
            `SELECT * FROM groups WHERE group_name = $1`,
            [groupName]
        );
        
        return result.rows[0];
    }

};

module.exports = Group;
