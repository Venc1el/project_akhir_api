const express = require('express');
const router = express.Router();
const storesController = require('../controllers/stores.controller');

router.get('/', storesController.getAllStores);
router.get('/:id', storesController.getStoreById);
router.post('/', storesController.createStore);
router.put('/:id', storesController.updateStore);
router.delete('/:id', storesController.deleteStore);

module.exports = router;