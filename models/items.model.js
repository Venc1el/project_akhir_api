const db = require('./db');

const Items = {
    getAll: (callback) => {
        db.query('SELECT * FROM items', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM items WHERE iditems = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO items SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE items SET ? WHERE iditems = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM items WHERE iditems = ?', [id], callback);
    },
};

module.exports = Items;
