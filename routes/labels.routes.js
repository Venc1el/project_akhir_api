const express = require('express');
const router = express.Router();
const labelsController = require('../controllers/labels.controller');

router.get('/', labelsController.getAllLabels);

module.exports = router;