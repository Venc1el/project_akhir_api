const Reports = require('../models/reports.model');

exports.getAllReports = (req, res) => {
    Reports.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getReportById = (req, res) => {
    Reports.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createReport = (req, res) => {
    Reports.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Report created', id: result.insertId });
    });
};

exports.updateReport = (req, res) => {
    Reports.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Report updated' });
    });
};

exports.deleteReport = (req, res) => {
    Reports.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Report deleted' });
    });
};
