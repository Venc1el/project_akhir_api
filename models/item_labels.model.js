const db = require('./db');

const Item_Labels = {
    getAll: (callback) => {
        db.query('SELECT * FROM item_labels', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM item_labels WHERE iditemlabels = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO item_labels SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE item_labels SET ? WHERE iditemlabels = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM item_labels WHERE iditemlabels = ?', [id], callback);
    },
};

module.exports = Item_Labels;
