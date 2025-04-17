const express = require('express');
const router = express.Router();
const itemLabelsController = require('../controllers/item_labels.controller');

router.get('/', itemLabelsController.getAllItemLabels);
router.get('/:id', itemLabelsController.getItemLabelById);
router.post('/', itemLabelsController.createItemLabel);
router.put('/:id', itemLabelsController.updateItemLabel);
router.delete('/:id', itemLabelsController.deleteItemLabel);

module.exports = router;