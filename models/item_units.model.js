const db = require('./db');

const Item_Units = {
    getAll: (callback) => {
        db.query('SELECT * FROM item_units', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM item_units WHERE idunits = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO item_units SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE item_units SET ? WHERE idunits = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM item_units WHERE idunits = ?', [id], callback);
    },
};

module.exports = Item_Units;
