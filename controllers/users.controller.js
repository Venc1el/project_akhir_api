const Users = require('../models/users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/mailer');

const authController = {
    register: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            const existingUser = await Users.findByEmail(email);
            if (existingUser) {
                // Jika statusnya pending, mungkin bisa diarahkan untuk kirim ulang email verifikasi
                if (existingUser.status === 'pending' && existingUser.role === 'pelanggan') {
                    return res.status(409).json({ message: 'Email sudah terdaftar dan menunggu verifikasi. Silakan cek email Anda.' });
                }
                return res.status(409).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // User akan dibuat dengan status 'pending' secara default dari model
            const userId = await Users.create(name, email, hashedPassword, 'pelanggan');

            // HANYA UNTUK PELANGGAN: Buat dan kirim token verifikasi
            if (userId) { // Pastikan user berhasil dibuat
                // Token verifikasi akan berisi idusers dan email user yang baru dibuat
                const verificationToken = jwt.sign(
                    { idusers: userId, name: name, email: email, role: 'pelanggan' },
                    process.env.JWT_SECRET_VERIFICATION,
                    { expiresIn: '1h' } // Token berlaku 1 jam
                );

                const verificationLink = `${process.env.VERIFICATION_LINK_BASE_URL}/${verificationToken}`;
                sendVerificationEmail(email, verificationLink);
            }

            res.status(201).json({
                message: 'Registrasi berhasil! Akun Anda berstatus pending. Silakan cek email Anda untuk verifikasi.',
                userId: userId,
                name: name,
                email: email,
                role: 'pelanggan',
                status: 'pending'
            });

        } catch (error) {
            console.error('Error in authController.register:', error.message);
            next(error);
        }
    },

    verifyAccount: async (req, res, next) => {
        const { token } = req.params;

        // URL untuk kembali ke aplikasi login (sesuaikan dengan URL sebenarnya)
        const appLoginUrl = process.env.APP_LOGIN_URL || 'http://localhost:3000/login'; // Tambahkan ini di .env atau sesuaikan

        // Base HTML structure and common styles
        const baseHtml = (title, message, isSuccess = false) => `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verifikasi Akun</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Poppins', sans-serif;
                        background-color: #f0f2f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .container {
                        background-color: #ffffff;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 500px;
                        width: 100%;
                    }
                    h1 {
                        color: ${isSuccess ? '#386A20' : '#dc3545'}; /* Green for success, Red for error */
                        font-size: 2.2em;
                        margin-bottom: 15px;
                    }
                    p {
                        color: #555;
                        font-size: 1.1em;
                        line-height: 1.6;
                        margin-bottom: 25px;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 25px;
                        background-color: #007bff; /* A nice blue for the button */
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-size: 1.1em;
                        transition: background-color 0.3s ease;
                    }
                    .btn:hover {
                        background-color: #0056b3;
                    }
                    .icon {
                        margin-bottom: 20px;
                    }
                    .icon img {
                        width: 80px;
                        height: 80px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">
                        ${isSuccess ? '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/512px-Twitter_Verified_Badge.svg.png" alt="Success Icon">' : '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Red_x.svg/512px-Red_x.svg.png" alt="Error Icon">'}
                    </div>
                    <h1>${title}</h1>
                    <p>${message}</p>
                </div>
            </body>
            </html>
        `;

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_VERIFICATION);

            const { idusers, name, email, role } = decodedToken; 

            if (role !== 'pelanggan') {
                return res.status(403).send(baseHtml(
                    'Akses Ditolak!',
                    'Hanya pelanggan yang dapat memverifikasi akun melalui tautan ini.',
                    false 
                ));
            }

            const user = await Users.findByIdForVerification(idusers);

            if (!user) {
                return res.status(400).send(baseHtml(
                    'Verifikasi Gagal!',
                    'Tautan verifikasi tidak valid atau akun tidak ditemukan.',
                    false
                ));
            }

            if (user.email !== email || user.name !== name) {
                return res.status(400).send(baseHtml(
                    'Verifikasi Gagal!',
                    'Tautan verifikasi tidak valid atau tidak cocok dengan akun.',
                    false
                ));
            }

            if (user.status === 'active') {
                return res.status(200).send(baseHtml(
                    'Akun Sudah Aktif!',
                    'Akun Anda sudah aktif sebelumnya. Anda dapat kembali ke aplikasi.',
                    true 
                ));
            }

            const isMarkedActive = await Users.markUserAsActive(user.idusers);

            if (isMarkedActive) {
                res.status(200).send(baseHtml(
                    'Verifikasi Akun Berhasil!',
                    'Akun Anda telah berhasil diaktifkan. Anda sekarang dapat login ke aplikasi.',
                    true 
                ));
            } else {
                return res.status(500).send(baseHtml(
                    'Terjadi Kesalahan!',
                    'Gagal memperbarui status akun menjadi aktif. Silakan coba lagi nanti.',
                    false
                ));
            }

        } catch (error) {
            console.error('Error in authController.verifyAccount:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).send(baseHtml(
                    'Tautan Kadaluarsa!',
                    'Tautan verifikasi sudah kadaluarsa. Silakan login dan minta tautan baru jika diperlukan.',
                    false
                ));
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).send(baseHtml(
                    'Tautan Tidak Valid!',
                    'Tautan verifikasi tidak valid. Mungkin rusak atau sudah digunakan.',
                    false
                ));
            }

            next(error);
        }
    },

    webLogin: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await Users.findByEmail(email);

            if (!user) {
                return res.status(401).json({ message: 'Email atau kata sandi salah.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email atau kata sandi salah.' });
            }

            const allowedRoles = ['admin', 'manager', 'owner'];
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Akses ditolak. Peran Anda tidak memiliki izin untuk login ke sistem ini.' });
            }

            let tokenExpiresIn;
            if (user.role === 'owner') {
                tokenExpiresIn = '7d'; 
            } else {
                tokenExpiresIn = '1d';
            }

            let jwtPayload = {
                idusers: user.idusers,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            };

            if (user.role === 'admin' || user.role === 'manager') {
                if (user.idstores === null || user.idstores === undefined) {
                    return res.status(400).json({ message: 'Akun admin/manager tidak terhubung dengan toko. Hubungi administrator.' });
                }
                jwtPayload.storeId = user.idstores;
            } else if (user.role === 'owner') {
                jwtPayload.storeId = null; 
            }

            const token = jwt.sign(
                jwtPayload,
                process.env.JWT_SECRET,
                { expiresIn: tokenExpiresIn }
            );

            res.status(200).json({
                message: 'Login berhasil!',
                token: token,
                idusers: user.idusers,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                storeId: user.idstores  
            });

        } catch (error) {
            console.error('Error in authController.webLogin:', error.message);
            next(error); 
        }
    },

    login: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await Users.findByEmail(email);

            if (!user) {
                return res.status(401).json({ message: 'Email atau kata sandi salah.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email atau kata sandi salah.' });
            }

            // Hanya pelanggan yang perlu status 'active' untuk login
            if (user.role === 'pelanggan' && user.status !== 'active') {
                let errorMessage = 'Akun Anda belum aktif.';
                if (user.status === 'pending') {
                    errorMessage += ' Silakan cek email Anda untuk verifikasi.';
                } else if (user.status === 'suspended') {
                    errorMessage += ' Akun Anda ditangguhkan. Silakan hubungi administrator.';
                } else if (user.status === 'deactivated') {
                    errorMessage += ' Akun Anda telah dinonaktifkan.';
                }
                return res.status(403).json({ message: errorMessage });
            }

            let tokenExpiresIn;
        
            if (user.role === 'pelanggan') {
                tokenExpiresIn = '5y'; // Contoh untuk pelanggan (mobile)
            } else if (user.role === 'admin' || user.role === 'manager') {
                tokenExpiresIn = '1d'; // Contoh untuk admin/manager (web)
            } else {
                tokenExpiresIn = '1h'; // Default fallback
            }

            const token = jwt.sign( 
                { idusers: user.idusers, name: user.name, email: user.email, role: user.role, status: user.status },
                process.env.JWT_SECRET,
                { expiresIn: tokenExpiresIn }
            );

            res.status(200).json({
                message: 'Login berhasil!',
                token: token,
                idusers: user.idusers, // Pastikan ini 'idusers' bukan 'userId' untuk konsisten dengan model Android
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });

        } catch (error) {
            console.error('Error in authController.login:', error.message);
            next(error); // Melemparkan error ke error handling middleware Express
        }
    }
};


module.exports = authController;