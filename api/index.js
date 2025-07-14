const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Tambahkan cors jika belum ada
const path = require('path');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const authRoutes = require('../routes/users.routes'); 
app.use('/api/auth', authRoutes);

const userRoutes = require('../routes/users.routes');
const categoryRoutes = require('../routes/category.routes');
const itemLabelsRoutes = require('../routes/item_labels.routes');
const itemUnitsRoutes = require('../routes/item_units.routes'); 
const itemsRoutes = require('../routes/items.routes');
const labelsRoutes = require('../routes/labels.routes');
const paymentsRoutes = require('../routes/payments.routes');
const reportsRoutes = require('../routes/reports.routes');
const storesRoutes = require('../routes/stores.routes');
const transactionsRoutes = require('../routes/transactions.routes');
const transactionDetailsRoutes = require('../routes/transaction_details.routes');
const userVerificationRoutes = require('../routes/user_verification.routes');
const deliveryAreasRoutes = require('../routes/delivery_areas.routes');

app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/item-labels', itemLabelsRoutes);
app.use('/api/item-units', itemUnitsRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/labels', labelsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/transaction-details', transactionDetailsRoutes);
app.use('/api/user-verification', userVerificationRoutes); 
app.use('/api/delivery-areas', deliveryAreasRoutes);

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan pada server.'; 

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token tidak valid.';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token sudah kadaluarsa.';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Autentikasi gagal.';
    }

    res.status(statusCode).json({
        message: message,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
});

module.exports = app;