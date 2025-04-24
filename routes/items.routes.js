const express = require('express');
const router = express.Router();
const itemController = require('../controllers/items.controller');
const upload = require('../middleware/upload');

router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.post('/upload-items', upload.array('photo', 8), itemController.addItemWithPhotos);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;