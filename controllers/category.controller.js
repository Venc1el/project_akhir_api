const Category = require('../models/category.model');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ message: 'Failed to retrieve categories.', error: error.message });
    }
};
