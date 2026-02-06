const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const atgFileController = require('../controllers/atgFileController');

// Configure Multer for ATG Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure this path resolves correctly relative to this file
        const uploadPath = path.join(__dirname, '../uploads/files');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Sanitize filename or just use timestamp prefix
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Routes
router.get('/api/atg-files', atgFileController.getAllFiles);
router.post('/api/atg-files', upload.single('file'), atgFileController.saveFileRecord);
router.get('/api/atg-files/org-chart', atgFileController.getOrgChart);
router.delete('/api/atg-files/:id', atgFileController.deleteFile);

module.exports = router;
