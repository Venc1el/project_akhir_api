const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/users.controller');

const registerValidationRules = [
    body('name')
        .notEmpty().withMessage('Nama tidak boleh kosong.')
        .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter.'),

    body('email')
        .notEmpty().withMessage('Email tidak boleh kosong.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Kata sandi tidak boleh kosong.')
        .isLength({ min: 6 }).withMessage('Kata sandi minimal 6 karakter.')
        .matches(/[0-9]/).withMessage('Kata sandi harus mengandung setidaknya satu angka.') 
];

const loginValidationRules = [
    body('email')
        .notEmpty().withMessage('Email tidak boleh kosong.')
        .isEmail().withMessage('Format email tidak valid.'),
    body('password')
        .notEmpty().withMessage('Kata sandi tidak boleh kosong.')
];

router.post('/register', registerValidationRules, authController.register);
router.get('/verify/:token', authController.verifyAccount);
router.post('/login', loginValidationRules, authController.login); 
router.post('/web-login', loginValidationRules, authController.webLogin);

module.exports = router;