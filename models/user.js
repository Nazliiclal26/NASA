// models/User.js
const pool = require('../config/db');

const User = {
    // Create a new user without hashing the password
    create: async (username, password, preferredGenres) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const result = await client.query(
                `INSERT INTO users (username, password, preferred_genres) 
                 VALUES ($1, $2, $3) RETURNING id, username, preferred_genres`,
                [username, password, preferredGenres]
            );
            const user = result.rows[0];
            
            await client.query('COMMIT');
            return user;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Find a user by their username
    findByUsername: async (username) => {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    // Find a user by their ID
    findById: async (id) => {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Validate user login credentials
    validatePassword: async (username, password) => {
        const user = await User.findByUsername(username);
        if (!user) return null;
        
        if (user.password !== password) return null;

        return user;
    },

    // Update user's preferred genres
    updatePreferredGenres: async (userId, preferredGenres) => {
        const result = await pool.query(
            `UPDATE users 
             SET preferred_genres = $1 
             WHERE id = $2 
             RETURNING id, username, preferred_genres`,
            [preferredGenres, userId]
        );
        return result.rows[0];
    }
};

module.exports = User;
