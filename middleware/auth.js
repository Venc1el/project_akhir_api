const jwt = require("jsonwebtoken");
const Users = require('../models/users.model');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token otentikasi tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const userFromDb = await Users.getById(req.user.idusers);

        if (!userFromDb) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan di database.' });
        }

        if (userFromDb.status === 'pending') {
            return res.status(403).json({ message: 'Akses ditolak. Akun Anda masih dalam status pending. Mohon selesaikan proses verifikasi.' });
        }

        req.user.status = userFromDb.status;
        req.user.role = userFromDb.role;
        req.user.storeId = userFromDb.idstores;

        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan saat otentikasi token.' });
    }
};


const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Akses ditolak. Informasi peran tidak ditemukan pada token.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.' });
        }
        // Opsional: Jika kamu ingin memastikan user juga aktif, tambahkan ini
        // if (req.user.status !== 'active') {
        //     return res.status(403).json({ message: 'Akses ditolak. Akun Anda belum aktif.' });
        // }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};