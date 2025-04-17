const Payments = require('../models/payments.model');

exports.getAllPayments = (req, res) => {
    Payments.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getPaymentById = (req, res) => {
    Payments.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createPayment = (req, res) => {
    Payments.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Payment created', id: result.insertId });
    });
};

exports.updatePayment = (req, res) => {
    Payments.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Payment updated' });
    });
};

exports.deletePayment = (req, res) => {
    Payments.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Payment deleted' });
    });
};
