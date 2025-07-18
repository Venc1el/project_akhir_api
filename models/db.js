const mysql = require('mysql2/promise');
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Koneksi ke database MySQL berhasil!');
        connection.release();
    } catch (error) {
        console.error('Koneksi ke database MySQL gagal:', error.message);
        process.exit(1);
    }
}

testDbConnection();
module.exports = pool;