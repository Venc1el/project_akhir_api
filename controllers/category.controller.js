const Category = require('../models/category.model');

exports.getAllCategory = (req, res) => {
    Category.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getCategoryById = (req, res) => {
    Category.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createCategory = (req, res) => {
    Category.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Category created', id: result.insertId });
    });
};

exports.updateCategory = (req, res) => {
    Category.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Category updated' });
    });
};

exports.deleteCategory = (req, res) => {
    Category.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Item deleted' });
    });
};
