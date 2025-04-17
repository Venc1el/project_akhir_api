const ItemLabels = require('../models/item_labels.model');

exports.getAllItemLabels = (req, res) => {
    ItemLabels.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getItemLabelById = (req, res) => {
    ItemLabels.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createItemLabel = (req, res) => {
    ItemLabels.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Item Label created', id: result.insertId });
    });
};

exports.updateItemLabel = (req, res) => {
    ItemLabels.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Item Label updated' });
    });
};

exports.deleteItemLabel = (req, res) => {
    ItemLabels.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Item Label deleted' });
    });
};
