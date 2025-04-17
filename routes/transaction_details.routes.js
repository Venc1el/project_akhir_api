const express = require('express');
const router = express.Router();
const transactionDetailsController = require('../controllers/transaction_details.controller');

router.get('/', transactionDetailsController.getAllTransactionDetails);
router.get('/:id', transactionDetailsController.getTransactionDetailsById);
router.post('/', transactionDetailsController.createTransactionDetails);
router.put('/:id', transactionDetailsController.updateTransactionDetails);
router.delete('/:id', transactionDetailsController.deleteTransactionDetails);

module.exports = router;