// index.ts (masih pakai CommonJS style supaya bisa require file .js)
const express = require('express');
const dotenv = require('dotenv');
const app = express();
const path = require('path');

dotenv.config();

// Import routes (pakai require karena file lain .js)
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

// Use routes
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

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
});

module.exports = app;
