const Transactions = require('../models/transactions.model');

const calculateDaysBetweenDates = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date format for calculation:", startDateStr, endDateStr);
        return 1; // Default to 1 day if dates are invalid
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 0 ? 1 : diffDays;
};

exports.markTransactionReturned = async (req, res) => {
    const transactionId = req.params.id;
    const { actual_return_date } = req.body;

    if (!actual_return_date) {
        return res.status(400).json({ message: 'Actual return date is required.' });
    }

    try {
        const result = await Transactions.markReturned(transactionId, actual_return_date);
        res.status(200).json({ message: 'Transaction successfully marked as returned.', fine: result.fine });
    } catch (error) {
        console.error('Error marking transaction returned:', error);
        res.status(500).json({ message: error.message || 'Failed to mark transaction as returned.' });
    }
};

exports.getTransactionReport = async (req, res) => {
    try {
        const { role, storeId } = req.user;
        const report = await Transactions.getReportByRole(storeId, role);
        res.status(200).json(report);
    } catch (error) {
        console.error('Error in getTransactionReport:', error);
        res.status(500).json({ message: 'Gagal mengambil laporan transaksi.' });
    }
};

exports.getTransactionDetail = async (req, res) => {
    try {
        const { id } = req.params
        const data = await Transactions.getTransactionDetail(id)

        if (!data) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' })
        }

        res.json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Gagal mengambil detail transaksi' })
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const {
            rental_date,
            return_date,
            delivery_method,
            delivery_address,
            delivery_city,
            delivery_province,
            delivery_district,
            payment_method,
            total_price,
            recipient_name,
            recipient_phone,
            idusers,
            idstores
        } = req.body;

        const details = JSON.parse(req.body.details || '[]');
        if (!details.length) {
            return res.status(400).json({ message: 'Detail transaksi kosong.' });
        }

        const isDelivery = delivery_method === 'antar';
        const is_delivery_valid = isDelivery
            ? await Transactions.isDeliveryAvailable(delivery_province, delivery_city)
            : false;

        const id_card_photo = req.file ? `/uploads/identitas/${req.file.filename}` : null;

        if (isDelivery && !id_card_photo) {
            return res.status(400).json({ message: 'Foto KTP wajib untuk metode antar ke rumah.' });
        }

        const trx = await Transactions.createFullTransaction({
            rental_date,
            return_date,
            delivery_method,
            delivery_address,
            delivery_city,
            delivery_province,
            delivery_district,
            payment_method,
            total_price,
            id_card_photo,
            recipient_name,
            recipient_phone,
            idusers,
            idstores,
            details,
            is_delivery_valid
        });

        return res.status(201).json({
            message: 'Transaksi berhasil dibuat.',
            data: trx
        });

    } catch (err) {
        console.error('Create Transaction Error:', err);
        res.status(500).json({ message: 'Gagal membuat transaksi.', error: err.message });
    }
};

exports.getTransactionStatistic = async (req, res) => {
    try {
        const { periode } = req.query;
        const validPeriode = ['harian', 'bulanan', 'tahunan'];

        if (!validPeriode.includes(periode)) {
            return res.status(400).json({
                status: 'error',
                message: 'Periode harus salah satu dari: harian, bulanan, tahunan',
            });
        }

        const idstores = req.user?.role === 'manager' ? req.user?.idstores : null;

        const data = await Transactions.getTransactionStatistic(periode, idstores);

        res.status(200).json({
            status: 'success',
            periode,
            jumlah_periode: data.length,
            deskripsi: `Statistik pendapatan ${periode} berdasarkan tanggal sewa.`,
            data,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || 'Gagal mengambil data statistik transaksi.',
        });
    }
};