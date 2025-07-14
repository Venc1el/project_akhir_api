const Labels = require('../models/labels.model');

exports.getAllLabels = async (req, res) => {
    try {
        const labels = await Labels.getAll();
        res.status(200).json(labels);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve labels.', error: error.message });
    }
};
