const Transaction_Details = require('../models/transaction_details.model');

exports.getAllTransactionDetails = (req, res) => {
    Transaction_Details.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getTransactionDetailsById = (req, res) => {
    Transaction_Details.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createTransactionDetails = (req, res) => {
    Transaction_Details.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Transaction Details created', id: result.insertId });
    });
};

exports.updateTransactionDetails = (req, res) => {
    Transaction_Details.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Transaction Details updated' });
    });
};

exports.deleteTransactionDetails = (req, res) => {
    Transaction_Details.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Transaction Details deleted' });
    });
};
