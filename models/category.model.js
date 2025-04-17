const db = require('./db');

const Category = {
    getAll: (callback) => {
        db.query('SELECT * FROM category', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM category WHERE idcategory = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO category SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE category SET ? WHERE idcategory = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM category WHERE idcategory = ?', [id], callback);
    },
};

module.exports = Category;
