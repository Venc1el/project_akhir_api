const Item_Units = require('../models/item_units.model');
const pool = require('../models/db'); // Menggunakan pool langsung untuk query spesifik

exports.getAllUnits = async (req, res) => {
    try {
        const results = await Item_Units.getAll();
        res.json(results);
    } catch (error) {
        console.error("Error in getAllUnits:", error);
        res.status(500).json({ error: 'Gagal mengambil semua unit.' });
    }
};

exports.getUnitsById = async (req, res) => {
    try {
        const result = await Item_Units.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Unit tidak ditemukan.' });
        }
        res.json(result);
    } catch (error) {
        console.error("Error in getUnitsById:", error);
        res.status(500).json({ error: 'Gagal mengambil unit.' });
    }
};

exports.createUnits = async (req, res) => {
    const { size, kondisi, status, iditems } = req.body;

    if (!kondisi || !status || !iditems) {
        return res.status(400).json({ message: "Data Tidak Lengkap: kondisi, status, dan iditems wajib diisi." });
    }

    try {
        // Query untuk mendapatkan nama item
        const [itemResult] = await pool.execute('SELECT name FROM items WHERE iditems = ?', [iditems]);

        if (itemResult.length === 0) {
            return res.status(404).json({ message: 'Item tidak ditemukan.' });
        }
        const itemName = itemResult[0].name.replace(/\s+/g, '');

        // Query untuk menghitung unit yang sudah ada
        const [countResult] = await pool.execute('SELECT COUNT(*) AS count FROM item_units WHERE iditems = ?', [iditems]);
        const nextNumber = (countResult[0].count + 1).toString().padStart(3, '0');
        const unit_code = `${itemName}${nextNumber}`;

        const data = {
            unit_code,
            size: size || null, // Size bisa null jika tidak ada
            kondisi,
            status,
            iditems,
        };

        const insertId = await Item_Units.create(data);

        res.status(201).json({
            message: 'Unit berhasil ditambahkan',
            idunits: insertId,
            unit_code,
            data // Mengembalikan data yang disimpan
        });

    } catch (error) {
        console.error("Error in createUnits:", error);
        res.status(500).json({ message: 'Gagal menyimpan unit.', error: error.message });
    }
};

exports.updateUnits = async (req, res) => {
    const unitId = req.params.id;
    const updateData = req.body;

    try {
        const updated = await Item_Units.update(unitId, updateData);
        if (!updated) {
            return res.status(404).json({ message: 'Unit tidak ditemukan atau tidak ada perubahan data.' });
        }
        res.json({ message: 'Unit berhasil diperbarui.' });
    } catch (error) {
        console.error("Error in updateUnits:", error);
        res.status(500).json({ error: 'Gagal memperbarui unit.' });
    }
};

exports.deleteUnits = async (req, res) => {
    const unitId = req.params.id;
    try {
        const deleted = await Item_Units.delete(unitId);
        if (!deleted) {
            return res.status(404).json({ message: 'Unit tidak ditemukan.' });
        }
        res.json({ message: 'Unit berhasil dihapus.' });
    } catch (error) {
        console.error("Error in deleteUnits:", error);
        res.status(500).json({ error: 'Gagal menghapus unit.' });
    }
};

exports.getStokBySize = async (req, res) => {
    const { size } = req.params; // Perhatikan: jika size dari URL path, gunakan req.params
    const { iditems } = req.query; // jika iditems dari query parameter, gunakan req.query

    if (!size || !iditems) {
        return res.status(400).json({ message: "Parameter 'size' (dari URL) dan 'iditems' (dari query) diperlukan." });
    }

    try {
        const result = await Item_Units.getStokBySize(size, iditems);
        const stok = result?.stok || 0; // Mengakses stok dari objek yang dikembalikan
        res.status(200).json({ size, iditems, stok });
    } catch (error) {
        console.error("Error in getStokBySize:", error);
        res.status(500).json({ message: "Gagal mengambil stok.", error: error.message });
    }
};

exports.getUkuranByItemId = async (req, res) => {
    const iditems = req.params.iditems; // Pastikan ini sesuai dengan definisi rute Anda (misal: /:iditems)

    try {
        const results = await Item_Units.getUkuranByItemId(iditems);
        // Map hasil untuk hanya mendapatkan nilai 'size' dari setiap objek
        const sizes = results.map(row => row.size);
        res.json(sizes);
    } catch (error) {
        console.error("Error in getUkuranByItemId:", error);
        res.status(500).json({ message: 'Gagal mengambil ukuran.', error: error.message });
    }
};

exports.getUnitsByStore = async (req, res) => {
    try {
        const { storeId } = req.user;
        if (!storeId) {
            return res.status(400).json({ message: 'Akun tidak terkait dengan toko manapun.' });
        }

        const units = await Item_Units.getAllByStore(storeId);
        res.status(200).json(units);
    } catch (error) {
        console.error('Error getting item units:', error);
        res.status(500).json({ message: 'Gagal mengambil data unit barang.', error: error.message });
    }
};