const express = require('express');
const router = express.Router();
const deliveryAreasController = require('../controllers/delivery_areas.controller');

router.get('/:id', deliveryAreasController.getDeliveryAreasByStore);

router.post('/validate-delivery', deliveryAreasController.validateDeliveryAddress);

module.exports = router;
