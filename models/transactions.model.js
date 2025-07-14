// models/transactions.model.js
const pool = require('./db'); // Pastikan ini mengacu pada pool yang promisified (mysql2/promise)

const Transactions = {
    async isDeliveryAvailable(province, city) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM delivery_areas WHERE province = ? AND city = ?',
                [province, city]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking delivery availability:', error);
            throw new Error('Gagal memeriksa ketersediaan pengiriman.');
        }
    },

    async markReturned(idtransactions, actualReturnDate) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [trxRows] = await connection.execute(
                'SELECT return_date FROM transactions WHERE idtransactions = ?',
                [idtransactions]
            );
            if (trxRows.length === 0) {
                throw new Error("Transaksi tidak ditemukan.");
            }

            const expectedDate = new Date(trxRows[0].return_date);
            const actualDate = new Date(actualReturnDate);
            let fine = 0;

            if (actualDate > expectedDate) {
                const daysLate = Math.ceil((actualDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));

                const [detailsRows] = await connection.execute(
                    'SELECT SUM(subtotal) AS total FROM transaction_details WHERE idtransactions = ?',
                    [idtransactions]
                );
                const totalTransactionValue = detailsRows[0].total || 0;
                fine = totalTransactionValue * 0.1 * daysLate;
            }

            await connection.execute(
                'UPDATE transactions SET status = "Telah Kembali" WHERE idtransactions = ?',
                [idtransactions]
            );

            const [unitsRows] = await connection.execute(
                'SELECT idunits FROM transaction_details WHERE idtransactions = ?',
                [idtransactions]
            );

            for (let unit of unitsRows) {
                await connection.execute(
                    'UPDATE item_units SET status = "Tersedia" WHERE idunits = ?',
                    [unit.idunits]
                );
            }

            await connection.commit();
            return { success: true, fine };

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error marking transaction as returned:', error);
            throw new Error('Gagal menandai transaksi sebagai kembali: ' + error.message);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    async getReportByRole(idstores, role) {
        try {
            const queryParams = [];
            let whereClause = '';

            if (role === 'admin' || role === 'manager') {
                whereClause = 'WHERE t.idstores = ?';
                queryParams.push(idstores);
            }

            const [rows] = await pool.execute(`
                SELECT 
                    t.idtransactions,
                    u.name AS user_name,
                    s.name AS store_name,
                    t.rental_date,
                    t.return_date,
                    t.status,
                    t.total_price,
                    COUNT(td.iddetailtransactions) AS total_items
                FROM 
                    transactions t
                JOIN users u ON t.idusers = u.idusers
                JOIN stores s ON t.idstores = s.idstores
                JOIN transaction_details td ON td.idtransactions = t.idtransactions
                ${whereClause}
                GROUP BY t.idtransactions
                ORDER BY t.rental_date DESC
            `, queryParams);

            return rows;
        } catch (error) {
            console.error('Error in getReportByRole:', error);
            throw new Error('Gagal mengambil laporan transaksi.');
        }
    },

    async getTransactionDetail(idtransactions) {
        try {
            const [trxRows] = await pool.execute(
                `SELECT 
              t.idtransactions, t.status, t.rental_date, t.return_date,
              t.delivery_method, t.delivery_address, t.delivery_city,
              t.delivery_province, t.payment_method, t.total_price,
              t.id_card_photo,
              t.recipient_name, t.recipient_phone, t.is_delivery_valid,
    
              u.name AS user_name, u.email,
    
              s.name AS store_name, s.address AS store_address,
              s.province AS store_province, s.city AS store_city
    
            FROM transactions t
            JOIN users u ON u.idusers = t.idusers
            LEFT JOIN user_verifications uv ON uv.idusers = u.idusers
            JOIN stores s ON s.idstores = t.idstores
            WHERE t.idtransactions = ?
            LIMIT 1`,
                [idtransactions]
            )

            if (trxRows.length === 0) return null

            const trx = trxRows[0]

            const [detailsRows] = await pool.execute(
                `SELECT 
              td.price_per_day, td.days_rented, td.subtotal,
              iu.unit_code, iu.size, iu.kondisi,
              i.name AS item_name, i.photo
            FROM transaction_details td
            JOIN item_units iu ON iu.idunits = td.idunits
            JOIN items i ON i.iditems = iu.iditems
            WHERE td.idtransactions = ?`,
                [idtransactions]
            )

            const [paymentRows] = await pool.execute(
                `SELECT payment_date, amount AS payment_amount, method AS payment_method, status
             FROM payments
             WHERE idtransactions = ?
             LIMIT 1`,
                [idtransactions]
            )

            return {
                idtransactions: trx.idtransactions,
                status: trx.status,
                rental_date: trx.rental_date,
                return_date: trx.return_date,
                actual_return_date: trx.actual_return_date,
                delivery_method: trx.delivery_method,
                delivery_address: trx.delivery_address,
                delivery_city: trx.delivery_city,
                delivery_province: trx.delivery_province,
                payment_method: trx.payment_method,
                total_price: Number(trx.total_price),
                id_card_photo: trx.id_card_photo,
                is_delivery_valid: Boolean(trx.is_delivery_valid),

                recipient: {
                    name: trx.recipient_name,
                    phone: trx.recipient_phone,
                },

                user: {
                    full_name: trx.user_name,
                    phone_number: trx.user_phone,
                    email: trx.email,
                },

                store: {
                    store_name: trx.store_name,
                    store_address: trx.store_address,
                    province: trx.store_province,
                    city: trx.store_city,
                    phone_number: trx.store_phone,
                },

                details: detailsRows.map(d => ({
                    price_per_day: Number(d.price_per_day),
                    days_rented: d.days_rented,
                    subtotal: Number(d.subtotal),
                    unit: {
                        unit_code: d.unit_code,
                        size: d.size,
                        kondisi: d.kondisi,
                        item: {
                            item_name: d.item_name,
                            image: d.image
                        }
                    }
                })),

                payment: paymentRows[0]
                    ? {
                        payment_date: paymentRows[0].payment_date,
                        payment_amount: Number(paymentRows[0].payment_amount),
                        payment_proof: paymentRows[0].payment_proof
                    }
                    : null
            }
        } catch (err) {
            console.error('Error fetching transaction detail:', err)
            throw new Error('Gagal mengambil detail transaksi')
        }
    },

    async getTransactionStatistic(periode, idstores = null) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            let query = '';
            let params = [];

            const baseCondition = `
                FROM transactions
                WHERE status != 'Dibatalkan'
                ${idstores ? 'AND idstores = ?' : ''}
            `;

            if (periode === 'harian') {
                query = `
                    SELECT DATE(rental_date) AS label,
                            SUM(total_price) AS total_pendapatan,
                            COUNT(*) AS jumlah_transaksi
                    ${baseCondition}
                    GROUP BY DATE(rental_date)
                    ORDER BY DATE(rental_date)
                `;
            } else if (periode === 'bulanan') {
                query = `
                    SELECT
                        DATE_FORMAT(rental_date, '%Y-%m') AS period,
                        DATE_FORMAT(rental_date, '%M %Y') AS label,
                        SUM(total_price) AS total_pendapatan,
                        COUNT(*) AS jumlah_transaksi
                    ${baseCondition}
                    GROUP BY period
                    ORDER BY period
                `;
            } else if (periode === 'tahunan') {
                query = `
                    SELECT YEAR(rental_date) AS label,
                            SUM(total_price) AS total_pendapatan,
                            COUNT(*) AS jumlah_transaksi
                    ${baseCondition}
                    GROUP BY YEAR(rental_date)
                    ORDER BY YEAR(rental_date)
                `;
            } else {
                throw new Error('Periode tidak valid. Gunakan harian, bulanan, atau tahunan.');
            }

            if (idstores) params.push(idstores);

            const [rows] = await connection.execute(query, params);
            await connection.commit();

            return rows.map(row => ({
                periode: row.label,
                total_pendapatan: parseFloat(row.total_pendapatan || 0),
                jumlah_transaksi: row.jumlah_transaksi || 0,
            }));
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Gagal mengambil statistik:', error);
            throw new Error('Gagal mengambil data statistik transaksi: ' + error.message);
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = Transactions;