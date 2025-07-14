const pool = require('./db'); 

class Item_Units {
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM item_units');
            return rows;
        } catch (error) {
            console.error('Error in Item_Units.getAll:', error);
            throw new Error('Database query failed for getting all item units.');
        }
    }

    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM item_units WHERE idunits = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in Item_Units.getById:', error);
            throw new Error('Database query failed for getting item unit by ID.');
        }
    }

    static async create(data) {
        const { unit_code, size, kondisi, status, iditems } = data;
        try {
            const [result] = await pool.execute(
                'INSERT INTO item_units (unit_code, size, kondisi, status, iditems) VALUES (?, ?, ?, ?, ?)',
                [unit_code, size, kondisi, status, iditems]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error in Item_Units.create:', error);
            throw new Error('Database query failed for creating item unit.');
        }
    }

    static async update(id, data) {
        const { size, kondisi, status, iditems } = data;
        try {
            const [result] = await pool.execute(
                'UPDATE item_units SET size = ?, kondisi = ?, status = ?, iditems = ? WHERE idunits = ?',
                [size, kondisi, status, iditems, id]
            );
            return result.affectedRows > 0; 
        } catch (error) {
            console.error('Error in Item_Units.update:', error);
            throw new Error('Database query failed for updating item unit.');
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM item_units WHERE idunits = ?', [id]);
            return result.affectedRows > 0; 
        } catch (error) {
            console.error('Error in Item_Units.delete:', error);
            throw new Error('Database query failed for deleting item unit.');
        }
    }

    static async getStokBySize(size, iditems) {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) AS stok FROM item_units WHERE size = ? AND iditems = ? AND status = "available"',
                [size, iditems]
            );
            return rows[0]; 
        } catch (error) {
            console.error('Error in Item_Units.getStokBySize:', error);
            throw new Error('Database query failed for getting stock by size.');
        }
    }

    static async getUkuranByItemId(iditems) {
        try {
            const [rows] = await pool.execute(
                'SELECT DISTINCT size FROM item_units WHERE iditems = ? AND size IS NOT NULL',
                [iditems]
            );
            return rows; 
        } catch (error) {
            console.error('Error in Item_Units.getUkuranByItemId:', error);
            throw new Error('Database query failed for getting sizes by item ID.');
        }
    }

    static async getAllByStore(storeId) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    u.idunits,
                    u.unit_code,
                    u.size,
                    u.kondisi,
                    u.status,
                    u.iditems,
                    i.name AS item_name,
                    s.name AS store_name
                FROM 
                    item_units u
                JOIN 
                    items i ON u.iditems = i.iditems
                JOIN 
                    stores s ON u.idstores = s.idstores
                WHERE 
                    u.idstores = ?
                ORDER BY 
                    u.idunits DESC
            `, [storeId]);
            return rows;
        } catch (error) {
            console.error('Error in ItemUnits.getAllByStore:', error);
            throw new Error('Database query failed for item units by store.');
        }
    }
}

module.exports = Item_Units;