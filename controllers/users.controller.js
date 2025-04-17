const Users = require('../models/users.model');

exports.getAllUsers = (req, res) => {
    Users.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    Users.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.createUser = (req, res) => {
    Users.create(req.body, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'User created', id: result.insertId });
    });
};

exports.updateUser = (req, res) => {
    Users.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'User updated' });
    });
};

exports.deleteUser = (req, res) => {
    Users.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'User deleted' });
    });
};
