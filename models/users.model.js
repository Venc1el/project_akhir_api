const db = require('./db');

const Users = {
    getAll: (callback) => {
        db.query('SELECT * FROM users', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM users WHERE idusers = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO users SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE users SET ? WHERE idusers = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM users WHERE idusers = ?', [id], callback);
    },
};

module.exports = Users;
