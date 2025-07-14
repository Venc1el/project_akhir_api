const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const authMiddleware = require('../middleware/auth'); 

const upload = require('../middleware/upload');


router.post(
    '/post-from-cart', 
    upload.single('id_card_photo'), 
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('pelanggan'),
    transactionController.createTransaction
);

router.put(
    '/returned/:id', 
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'),
    transactionController.markTransactionReturned
);

router.get(
    '/report',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager', 'owner'),
    transactionController.getTransactionReport
);

router.get('/detail/:id', 
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager', 'owner'),
    transactionController.getTransactionDetail);

router.get('/statistik/transaksi',
    authMiddleware.authenticateToken,
    transactionController.getTransactionStatistic);

module.exports = router;