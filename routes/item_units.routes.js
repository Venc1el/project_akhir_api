const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const itemUnitsController = require('../controllers/item_units.controller');

router.get('/', itemUnitsController.getAllUnits);
router.get('/admin', authMiddleware.authenticateToken, authMiddleware.authorizeRoles(['admin', 'manager']), itemUnitsController.getUnitsByStore);
router.get('/:id', itemUnitsController.getUnitsById);
router.get('/stok/:size', itemUnitsController.getStokBySize);
router.get('/ukuran/:iditems', itemUnitsController.getUkuranByItemId);
router.post('/', itemUnitsController.createUnits);
router.put('/:id', itemUnitsController.updateUnits);
router.delete('/:id', itemUnitsController.deleteUnits);

module.exports = router;