const nodemailer = require('nodemailer');
require('dotenv').config(); // Pastikan ini ada untuk memuat variabel dari .env

const transporter = nodemailer.createTransport({
    service: 'gmail', // Menggunakan layanan Gmail
    auth: {
        user: process.env.EMAIL_USER, // Alamat email pengirim
        pass: process.env.EMAIL_PASS   // App Password atau password email pengirim
    }
});

const sendVerificationEmail = async (toEmail, verificationLink) => {
    const mailOptions = {
        from: `"Hiking Rental App" <${process.env.EMAIL_USER}>`, // Nama pengirim dan email
        to: toEmail, // Alamat email penerima
        subject: 'Verifikasi Akun Hiking Rental Anda',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Selamat datang di Hiking Rental App!</h2>
                <p>Terima kasih telah mendaftar. Untuk mengaktifkan akun Anda, mohon verifikasi alamat email Anda dengan mengklik tautan di bawah ini:</p>
                <p style="margin: 20px 0;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #386A20; color: white; text-decoration: none; border-radius: 5px;">Verifikasi Akun Sekarang</a>
                </p>
                <p>Tautan ini akan kadaluarsa dalam 1 jam.</p>
                <p>Jika Anda tidak mendaftar di Hiking Rental App, Anda bisa mengabaikan email ini.</p>
                <p>Terima kasih,<br/>Tim Hiking Rental App</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email verifikasi berhasil dikirim ke: ${toEmail}`);
    } catch (error) {
        console.error(`Gagal mengirim email verifikasi ke ${toEmail}:`, error);
        // Penting: Jika gagal, berikan feedback yang jelas.
        // Error umum:
        // - 'Invalid login: 535-5.7.8 Username and Password not accepted.' -> Masalah EMAIL_USER/EMAIL_PASS (App Password salah/belum dibuat)
        // - 'Connection timed out' atau 'ETIMEDOUT' -> Masalah jaringan atau firewall
        // - 'Missing credentials for "PLAIN"' -> Konfigurasi auth di transporter salah
        throw new Error('Gagal mengirim email verifikasi. Silakan coba lagi nanti.'); // Lempar error agar bisa ditangkap oleh controller
    }
};

module.exports = { sendVerificationEmail };