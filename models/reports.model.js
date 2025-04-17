const db = require('./db');

const Reports = {
    getAll: (callback) => {
        db.query('SELECT * FROM reports', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM reports WHERE idreports = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO reports SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE reports SET ? WHERE idreports = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM reports WHERE idreports = ?', [id], callback);
    },
};

module.exports = Reports;
