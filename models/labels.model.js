const pool = require('./db');

class Labels {
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT idlabels, name FROM labels');
            return rows;
        } catch (error) {
            throw new Error('Database query failed for getting all labels.');
        }
    }
}

module.exports = Labels;
