const db = require('./db');

const Transaction_Details = {
    getAll: (callback) => {
        db.query('SELECT * FROM transaction_details', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM transaction_details WHERE iddetailtransactions = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO transaction_details SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE transaction_details SET ? WHERE iddetailtransactions = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM transaction_details WHERE iddetailtransactions = ?', [id], callback);
    },
};

module.exports = Transaction_Details;
