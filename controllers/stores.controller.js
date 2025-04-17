const Stores = require('../models/stores.model');

exports.getAllStores = (req, res) => {
    Stores.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getStoreById = (req, res) => {
    Stores.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createStore = (req, res) => {
    Stores.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Store created', id: result.insertId });
    });
};

exports.updateStore = (req, res) => {
    Stores.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Store updated' });
    });
};

exports.deleteStore = (req, res) => {
    Stores.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Store deleted' });
    });
};
