const db = require('./db');

const Transactions = {
    getAll: (callback) => {
        db.query('SELECT * FROM transactions', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM transactions WHERE idtransactions = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO transactions SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE transactions SET ? WHERE idtransactions = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM transactions WHERE idtransactions = ?', [id], callback);
    },
};

module.exports = Transactions;
