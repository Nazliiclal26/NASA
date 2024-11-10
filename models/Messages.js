const pool = require('../config/db');

const Messages = {
    add: async (group_id, sender_id, user_message) => {
        if (!user_message || !sender_id || !group_id) {
            throw new Error ("One of more of your parameters are undefinded");
        }
        const result = await pool.query(
            `INSERT INTO messages (group_id, sender_id, user_message) 
            VALUES ($1, $2, $3) RETURNING *;`, 
            [group_id, sender_id, user_message]
        );
       
        return result.rows[0];
    },

    getMessagesByGroupId: async (group_id) => {
        if (!group_id) {
            throw new Error ("Group id can not be null");
        }

        const result = await pool.query(
            `SELECT users.username, messages.user_message 
            FROM messages
            INNER JOIN users on messages.sender_id = users.id
            WHERE messages.group_id = $1;`, 
            [group_id]
        );

        return result.rows;
    },

    getMessagesFromUser: async (user_id) => {
        const result = await pool.query(
            `SELECT messages.sender_id, username, user_message 
            FROM messages
            INNER JOIN users on messages.sender_id = users.id
            WHERE messages.sender_id = $1;`, 
            [user_id]
        );
        
        return result.rows;

    }
}

module.exports = Messages; 