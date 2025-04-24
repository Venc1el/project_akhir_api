const multer = require('multer');
const path = require('path');

// Penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension); // Perhatikan file.fieldname
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
