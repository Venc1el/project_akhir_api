const Items = require('../models/items.model');
const path = require('path');
const fs = require('fs').promises;

exports.getAllItems = (req, res) => {
    Items.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getItemById = (req, res) => {
    Items.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
};

exports.addItemWithPhotos = (req, res) => {
    const { name, description, rental_price, idcategory } = req.body;

    // ✅ Check jika ada berkas yang diunggah
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Tidak ada berkas foto yang diunggah.' });
    }

    // Map setiap berkas yang diunggah untuk mendapatkan path relatifnya
    const photos = req.files.map(file => `/uploads/${file.filename}`);
    const photoJson = JSON.stringify(photos);

    const newItem = {
        name,
        description,
        rental_price,
        idcategory,
        photo: photoJson
    };

    Items.create(newItem, (err, result) => {
        if (err) {
            console.error("Error saat menambahkan item:", err);
            return res.status(500).json({ error: 'Gagal menambahkan item ke database.' });
        }
        res.status(201).json({
            message: 'Item berhasil ditambahkan beserta foto.',
            data: {
                iditems: result.insertId,
                ...newItem
            }
        });
    });
};

exports.updateItem = (req, res) => {
    Items.update(req.params.id, req.body, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Item updated' });
    });
};

exports.deleteItem = (req, res) => {
    const itemId = req.params.id;

    try {
        Items.getByIdWithPhotos(itemId, async (err, results) => {
            if (err) {
                console.error("Error saat mengambil item:", err);
                return res.status(500).json({ error: 'Gagal mengambil informasi item.' });
            }

            if (results.length > 0 && results[0].photo) {
                const photoJson = results = results[0].photo;
                try {
                    const photos = JSON.parse(photoJson);
                    if (Array.isArray(photos)) {
                        for (const photoPath of photos) {
                            const filename = path.basename(photoPath);
                            const filePath = path.join(__dirname, '../public/uploads', filename);

                            try {
                                await fs.unlink(filePath);
                                console.log(`Berkas berhasil dihapus: ${filePath}`);
                            } catch (unlinkErr) {
                                console.error(`Gagal menghapus berkas ${filePath}:`, unlinkErr);
                            }
                        }
                    } else {
                        const filename = path.basename(photoJson);
                        const filePath = path.join(__dirname, '../public/uploads', filename);
                        try {
                            await fs.unlink(filePath);
                            console.log(`Berkas berhasil dihapus: ${filePath}`);
                        } catch (unlinkErr) {
                            console.error(`Gagal menghapus berkas ${filePath}:`, unlinkErr);
                        }
                    }
                } catch (parseError) {
                    console.error("Gagal memparse JSON foto:", parseError);
                }
            }

            Items.delete(itemId, (deleteErr, deleteResult) => {
                if (deleteErr) {
                    console.error("Error saat menghapus item:", deleteErr);
                    return res.status(500).json({ error: 'Gagal menghapus item dari database.' });
                }
                res.json({ message: 'Item berhasil dihapus.' });
            });
        })
    } catch (error) {
        console.error("Error dalam proses penghapusan item:", error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus item.' });
    }
};


