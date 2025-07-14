const pool = require('./db'); 

class UserVerification {
    static async create(userId, identity_name, address, phone_number, identity_type, identity_number, gender, birth_place, birth_date, identity_document) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO user_verifications (idusers, identity_name, address, phone_number, identity_type, identity_number, gender, birth_place, birth_date, identity_document, verified_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, identity_name, address, phone_number, identity_type, identity_number, gender, birth_place, birth_date, identity_document, 'pending'] 
            );
            return result.insertId;
        } catch (error) {
            console.error('Error in UserVerification.create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('idusers')) {
                    throw new Error('Data verifikasi untuk pengguna ini sudah ada.');
                }
                if (error.message.includes('identity_number')) {
                    throw new Error('Nomor identitas ini sudah terdaftar.');
                }
            }
            throw new Error('Gagal menyimpan data verifikasi: ' + error.message);
        }
    }

    static async getByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM user_verifications WHERE idusers = ?',
                [userId]
            );
            return rows[0]; 
        } catch (error) {
            console.error('Error in UserVerification.getByUserId:', error);
            throw new Error('Gagal mengambil data verifikasi pengguna.');
        }
    }

    static async update(userId, identity_name, address, phone_number, identity_type, identity_number, gender, birth_place, birth_date, identity_document) {
        try {
            const [result] = await pool.execute(
                `UPDATE user_verifications SET
                identity_name = ?, address = ?, phone_number = ?, identity_type = ?, identity_number = ?, gender = ?, birth_place = ?, birth_date = ?, identity_document = ?,
                verified_status = 'pending'
                WHERE idusers = ?`,
                [identity_name, address, phone_number, identity_type, identity_number, gender, birth_place, birth_date, identity_document, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in UserVerification.update:', error);
            if (error.code === 'ER_DUP_ENTRY' && error.message.includes('identity_number')) {
                throw new Error('Nomor identitas ini sudah terdaftar.');
            }
            throw new Error('Gagal memperbarui data verifikasi: ' + error.message);
        }
    }

    static async updateVerificationStatus(iduserverific, newStatus) {
        try {
            const now = new Date();
            const [result] = await pool.execute(
                `UPDATE user_verifications SET verified_status = ?, verified_at = ? WHERE iduserverific = ?`,
                [newStatus, now, iduserverific]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in UserVerification.updateVerificationStatus:', error);
            throw new Error('Gagal memperbarui status verifikasi.');
        }
    }

    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT uv.*, u.name as userName, u.email as userEmail, u.status as userStatus FROM user_verifications uv JOIN users u ON uv.idusers = u.idusers');
            return rows;
        } catch (error) {
            console.error('Error in UserVerification.getAll:', error);
            throw new Error('Gagal mengambil semua data verifikasi.');
        }
    }

    static async getById(iduserverific) {
        try {
            const [rows] = await pool.execute('SELECT uv.*, u.name as userName, u.email as userEmail, u.status as userStatus FROM user_verifications uv JOIN users u ON uv.idusers = u.idusers WHERE uv.iduserverific = ?', [iduserverific]);
            return rows[0];
        } catch (error) {
            console.error('Error in UserVerification.getById:', error);
            throw new Error('Gagal mengambil data verifikasi berdasarkan ID.');
        }
    }
}

module.exports = UserVerification;