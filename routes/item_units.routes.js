const express = require('express');
const router = express.Router();
const itemUnitsController = require('../controllers/item_units.controller');

router.get('/', itemUnitsController.getAllUnits);
router.get('/:id', itemUnitsController.getUnitsById);
router.post('/', itemUnitsController.createUnits);
router.put('/:id', itemUnitsController.updateUnits);
router.delete('/:id', itemUnitsController.deleteUnits);

module.exports = router;