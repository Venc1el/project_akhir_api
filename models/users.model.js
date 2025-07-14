const pool = require('./db');

class Users {
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                `SELECT
                    idusers,
                    name,
                    email,
                    password,
                    role,
                    status,
                    idstores
                FROM users
                WHERE email = ?`,
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error in Users.findByEmail:', error);
            throw new Error('Database query failed for finding user by email.');
        }
    }


    // Fungsi create akan set status default 'pending'
    static async create(name, email, hashedPassword, role = 'pelanggan') {
        try {
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, role, 'pending'] // Set status default 'pending'
            );
            return result.insertId;
        } catch (error) {
            console.error('Error in create user:', error);
            throw new Error('Database query failed for creating user.');
        }
    }

    // Metode ini sekarang mencari user berdasarkan ID dan statusnya
    static async findByIdForVerification(id) {
        try {
            const [rows] = await pool.execute('SELECT idusers, name, email, status, role FROM users WHERE idusers = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in findByIdForVerification:', error);
            throw new Error('Database query failed for finding user by ID for verification.');
        }
    }

    // Metode untuk mengubah status user menjadi 'active'
    static async markUserAsActive(userId) {
        try {
            const [result] = await pool.execute(
                "UPDATE users SET status = 'active' WHERE idusers = ?",
                [userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in markUserAsActive:', error);
            throw new Error('Database query failed for marking user as active.');
        }
    }

    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT idusers, name, email, status, role, idstores FROM users WHERE idusers = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in getById:', error);
            throw new Error('Database query failed for getting user by ID.');
        }
    }
}


module.exports = Users;
