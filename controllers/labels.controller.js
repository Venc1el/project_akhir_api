const Labels = require('../models/labels.model');

exports.getAllLabels = (req, res) => {
    Labels.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getLabelById = (req, res) => {
    Labels.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createLabel = (req, res) => {
    Labels.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Label created', id: result.insertId });
    });
};

exports.updateLabel = (req, res) => {
    Labels.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Label updated' });
    });
};

exports.deleteLabel = (req, res) => {
    Labels.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'User deleted' });
    });
};
