const express = require('express');
const router = express.Router();
const itemController = require('../controllers/items.controller');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');

router.get('/', itemController.getAllItems); 
router.get(
    '/all',
    authMiddleware.authenticateToken,
    itemController.getAllItemsWithCategoryAndLabels
);
router.get('/:id', itemController.getItemById);
router.post('/', authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'),
    upload.array('photos', 8),
    itemController.createItem
);

router.put(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'),
    upload.array('new_photos', 8),
    itemController.updateItem
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin', 'manager'),
    itemController.deleteItem
);


module.exports = router;