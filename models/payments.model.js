const db = require('./db');

const Payments = {
    getAll: (callback) => {
        db.query('SELECT * FROM payments', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM payments WHERE idpayments = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO payments SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE payments SET ? WHERE idpayments = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM payments WHERE idpayments = ?', [id], callback);
    },
};

module.exports = Payments;
