const DeliveryAreas = require('../models/delivery_areas.model');

exports.getDeliveryAreasByStore = async (req, res) => {
    const storeId = req.params.id;

    try {
        const areas = await DeliveryAreas.getByStoreId(storeId);
        res.status(200).json(areas);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data delivery area', error: error.message });
    }
};

exports.validateDeliveryAddress = async (req, res) => {
    const { storeId, province, city, district } = req.body;

    if (!storeId || !province || !city || !district) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    try {
        const isValid = await DeliveryAreas.validateAddress(storeId, province, city, district);
        if (isValid) {
            return res.status(200).json({ valid: true });
        } else {
            return res.status(200).json({ valid: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal memvalidasi alamat', error: error.message });
    }
};
