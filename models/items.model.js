const pool = require('./db');

class Items {
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM items');
            return rows;
        } catch (error) {
            console.error('Error in Items.getAll:', error);
            throw new Error('Database query failed for getting all items.');
        }
    }

    static async getAllWithCategoryLabelsAndStock(storeId) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    i.iditems,
                    i.name,
                    i.description,
                    i.rental_price,
                    i.photo,
                    i.idcategory,
                    c.name AS category_name,
                    COUNT(u.idunits) AS stock,
                    COALESCE((
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', l.idlabels, 
                                'name', l.name
                            )
                        )
                        FROM item_labels il
                        JOIN labels l ON il.idlabels = l.idlabels
                        WHERE il.iditems = i.iditems
                    ), JSON_ARRAY()) AS labels
                FROM 
                    items i
                LEFT JOIN 
                    item_units u ON i.iditems = u.iditems 
                    AND u.idstores = ? 
                    AND u.status = 'Tersedia'
                LEFT JOIN 
                    category c ON c.idcategory = i.idcategory
                GROUP BY 
                    i.iditems
                ORDER BY 
                    i.name ASC
            `, [storeId]);            
    
            return rows;
        } catch (error) {
            console.error('Error in getAllWithCategoryLabelsAndStock:', error);
            throw new Error('Database query failed for item list with stock.');
        }
    }
    

    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM items WHERE iditems = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in Items.getById:', error);
            throw new Error('Database query failed for getting item by ID.');
        }
    }

    static async create(newItem) {
        const { name, description, rental_price, idcategory, photo } = newItem;
        try {
            const [result] = await pool.execute(
                'INSERT INTO items (name, description, rental_price, idcategory, photo) VALUES (?, ?, ?, ?, ?)',
                [name, description, rental_price, idcategory, photo]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error in Items.create:', error);
            throw new Error('Database query failed for creating item.');
        }
    }

    static async updateImage(iditems, newPhotoJson) {
        try {
            const [result] = await pool.execute(
                'UPDATE items SET photo = ? WHERE iditems = ?',
                [newPhotoJson, iditems]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Items.updateImage:', error);
            throw new Error('Database query failed for updating item image.');
        }
    }

    static async delete(iditems) {
        try {
            const [result] = await pool.execute('DELETE FROM items WHERE iditems = ?', [iditems]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Items.delete:', error);
            throw new Error('Database query failed for deleting item.');
        }
    }

    static async getByIdWithPhotos(id) {
        try {
            const [rows] = await pool.execute('SELECT photo FROM items WHERE iditems = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in Items.getByIdWithPhotos:', error);
            throw new Error('Database query failed for getting item photos by ID.');
        }
    }

    static async searchItemsByName(query) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM items WHERE name LIKE ?`,
                [`%${query}%`]
            );
            return rows;
        } catch (error) {
            console.error('Error searching items by name:', error);
            throw new Error('Database query failed for item search.');
        }
    }
}

module.exports = Items;