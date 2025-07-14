const Items = require('../models/items.model');
const path = require('path');
const fs = require('fs').promises; // Pastikan ini adalah fs.promises

exports.getAllItems = async (req, res) => {
    try {
        const { search } = req.query;

        let items;
        if (search) {
            items = await Items.searchItemsByName(search);
        } else {
            items = await Items.getAll();
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error getting items:', error);
        res.status(500).json({ message: 'Failed to retrieve items.', error: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const result = await Items.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Item tidak ditemukan.' });
        }
        res.json(result);
    } catch (error) {
        console.error("Error in getItemById:", error);
        res.status(500).json({ error: 'Gagal mengambil item.' });
    }
};

exports.createItem = async (req, res) => {
    const { name, description, rental_price, idcategory } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Tidak ada berkas foto yang diunggah.' });
    }

    const photos = req.files.map(file => `/uploads/items/${file.filename}`);
    const photoJson = JSON.stringify(photos);

    const newItem = {
        name,
        description,
        rental_price,
        idcategory,
        photo: photoJson
    };

    try {
        const insertId = await Items.create(newItem);
        res.status(201).json({
            message: 'Item berhasil ditambahkan beserta foto.',
            data: {
                iditems: insertId,
                ...newItem
            }
        });
    } catch (error) {
        console.error("Error saat menambahkan item:", error);
        res.status(500).json({ error: 'Gagal menambahkan item ke database.' });
    }
};

exports.updateItem = async (req, res) => {
    const iditems = req.params.id;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Tidak ada file yang diupload untuk update foto." });
    }

    const newPhotos = req.files.map(file => `/uploads/items/${file.filename}`);

    try {
        const item = await Items.getById(iditems);
        if (!item) {
            return res.status(404).json({ message: "Item tidak ditemukan" });
        }

        let existingPhotos = [];
        try {
            // result[0].photo diganti menjadi item.photo
            existingPhotos = JSON.parse(item.photo || '[]');
        } catch (e) {
            console.warn("Gagal memparse photo JSON, dianggap kosong.", e);
        }

        const updatedPhotos = [...existingPhotos, ...newPhotos];
        const updatedPhotoJson = JSON.stringify(updatedPhotos);

        const updated = await Items.updateImage(iditems, updatedPhotoJson);
        if (!updated) {
            return res.status(500).json({ message: "Gagal mengupdate foto item (tidak ada baris yang terpengaruh)." });
        }

        return res.status(200).json({
            message: "Foto berhasil ditambahkan",
            photo: updatedPhotos
        });

    } catch (error) {
        console.error("Error dalam updateItem:", error);
        res.status(500).json({ message: "Gagal mengupdate foto", error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;

    try {
        const itemWithPhotos = await Items.getByIdWithPhotos(itemId); // Panggil getByIdWithPhotos
        if (!itemWithPhotos) { // Jika item tidak ditemukan
            return res.status(404).json({ message: 'Item tidak ditemukan.' });
        }

        if (itemWithPhotos.photo) {
            let photosToDelete = [];
            try {
                const parsedPhotos = JSON.parse(itemWithPhotos.photo);

                if (Array.isArray(parsedPhotos)) {
                    photosToDelete = parsedPhotos;
                } else if (typeof parsedPhotos === 'string') {
                    photosToDelete = [parsedPhotos];
                }
            } catch (parseError) {
                console.error("Gagal memparse JSON foto:", parseError);
                if (typeof itemWithPhotos.photo === 'string' && itemWithPhotos.photo.startsWith('/uploads/items/')) {
                    photosToDelete = [itemWithPhotos.photo];
                }
            }

            for (const photoPath of photosToDelete) {
                const filename = path.basename(photoPath);
                const filePath = path.join(__dirname, '../public/uploads/items', filename);

                try {
                    await fs.unlink(filePath);
                } catch (unlinkErr) {
                    if (unlinkErr.code === 'ENOENT') {
                        console.warn(`Berkas tidak ditemukan untuk dihapus: ${filePath}`);
                    } else {
                        console.error(`Gagal menghapus berkas ${filePath}:`, unlinkErr);
                    }
                }
            }
        }

        const deleted = await Items.delete(itemId); // Panggil metode delete
        if (!deleted) {
            return res.status(500).json({ error: 'Gagal menghapus item dari database (tidak ada baris terpengaruh).' });
        }

        res.json({ message: 'Item berhasil dihapus beserta foto.' });

    } catch (error) {
        console.error("Error dalam proses penghapusan item:", error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus item.' });
    }
};

exports.getAllItemsWithCategoryAndLabels = async (req, res) => {
    try {
        const { storeId } = req.user;
        
        if (!storeId) {
            return res.status(400).json({ message: 'Akun tidak memiliki idstores yang valid.' });
        }

        const items = await Items.getAllWithCategoryLabelsAndStock(storeId);
        res.status(200).json(items);
    } catch (error) {
        console.error('Error getting items with stock:', error);
        res.status(500).json({ message: 'Failed to retrieve items with stock.', error: error.message });
    }
};
