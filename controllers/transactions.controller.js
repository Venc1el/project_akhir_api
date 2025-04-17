const Transactions = require('../models/transactions.model');

exports.getAllTransactions = (req, res) => {
    Transactions.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getTransactionById = (req, res) => {
    Transactions.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createTransaction = (req, res) => {
    Transactions.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Transaction created', id: result.insertId });
    });
};

exports.updateTransaction = (req, res) => {
    Transactions.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Transaction updated' });
    });
};

exports.deleteTransaction = (req, res) => {
    Transactions.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Transaction deleted' });
    });
};
