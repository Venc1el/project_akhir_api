// routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getAllCategories);

module.exports = router;
