// models/category.model.js
const pool = require('./db');

class Category {
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT idcategory, name FROM category');
            return rows;
        } catch (error) {
            throw new Error('Database query failed for getting all categories.');
        }
    }
}

module.exports = Category;
