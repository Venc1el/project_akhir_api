const db = require('./db');

const Stores = {
    getAll: (callback) => {
        db.query('SELECT * FROM stores', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM stores WHERE idstores = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO stores SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE stores SET ? WHERE idstores = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM stores WHERE idstores = ?', [id], callback);
    },
};

module.exports = Stores;
