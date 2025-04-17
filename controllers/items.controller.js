const Items = require('../models/items.model');

exports.getAllItems = (req, res) => {
    Items.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getItemById = (req, res) => {
    Items.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createItem = (req, res) => {
    Items.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Item created', id: result.insertId });
    });
};

exports.updateItem = (req, res) => {
    Items.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Item updated' });
    });
};

exports.deleteItem = (req, res) => {
    Items.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Item deleted' });
    });
};
