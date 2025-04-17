const db = require('./db');

const Labels = {
    getAll: (callback) => {
        db.query('SELECT * FROM labels', callback);
    },
    getById: (id, callback) => {
        db.query('SELECT * FROM labels WHERE idlabels = ?', [id], callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO labels SET ?', data, callback);
    },
    update: (id, data, callback) => {
        db.query('UPDATE labels SET ? WHERE idlabels = ?', [data, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM labels WHERE idlabels = ?', [id], callback);
    },
};

module.exports = Labels;
