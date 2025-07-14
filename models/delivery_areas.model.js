const pool = require('./db');

class DeliveryAreas {
    static async getByStoreId(storeId) {
        try {
            const [rows] = await pool.execute(
                `SELECT province, city, district FROM delivery_areas WHERE idstores = ?`,
                [storeId]
            );
            return rows;
        } catch (error) {
            console.error(error);
            throw new Error('Database query failed while fetching delivery areas.');
        }
    }

    static async validateAddress(storeId, province, city, district) {
        try {
            const [rows] = await pool.execute(
                `SELECT 1 FROM delivery_areas 
                WHERE idstores = ?
                AND LOWER(province) = LOWER(?)
                AND LOWER(city) = LOWER(?)
                AND LOWER(district) = LOWER(?)
                LIMIT 1`,
                [storeId, province, city, district]
            );
            return rows.length > 0;
        } catch (error) {
            console.error(error);
            throw new Error('Validation query failed');
        }
    }
    
}

module.exports = DeliveryAreas;
