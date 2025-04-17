const Item_Units = require('../models/item_units.model');

exports.getAllUnits = (req, res) => {
    Item_Units.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getUnitsById = (req, res) => {
    Item_Units.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createUnits = (req, res) => {
    Item_Units.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Units created', id: result.insertId });
    });
};

exports.updateUnits = (req, res) => {
    Item_Units.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Units updated' });
    });
};

exports.deleteUnits = (req, res) => {
    Item_Units.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Transaction Details deleted' });
    });
};
