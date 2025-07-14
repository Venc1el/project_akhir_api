// routes/user_verification.routes.js
const express = require('express');
const router = express.Router();
const userVerificationController = require('../controllers/user_verification.controller');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

router.post(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('pelanggan'), 
    upload.single('identity_document'),
    userVerificationController.submitVerificationData
);

router.get(
    '/status',
    authMiddleware.authenticateToken,
    userVerificationController.getVerificationStatus
);

router.get(
    '/admin',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'), 
    userVerificationController.getAllVerificationRequests
);

router.get(
    '/admin/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'),
    userVerificationController.getVerificationRequestById
);

router.put(
    '/admin/:id/status', 
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'),
    userVerificationController.approveOrRejectVerification
);

module.exports = router;