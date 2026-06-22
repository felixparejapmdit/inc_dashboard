const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const atgFileController = require('../controllers/atgFileController');

const allowedExtensions = new Set(['.pdf', '.docx', '.txt', '.pptx']);

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
        const safeOriginalName = file.originalname
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
            .replace(/\s+/g, "_");
        cb(null, Date.now() + "-" + safeOriginalName);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();

    if (!allowedExtensions.has(extension)) {
        return cb(new Error('Unsupported file type. Only PDF, DOCX, TXT, and PPTX are allowed.'));
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Routes
router.get('/api/atg-files', atgFileController.getAllFiles);
router.post('/api/atg-files', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        return next();
    });
}, atgFileController.saveFileRecord);
router.get('/api/atg-files/org-chart', atgFileController.getOrgChart);
router.get('/api/atg-files/:id/download', atgFileController.downloadFile);
router.put('/api/atg-files/:id', atgFileController.updateFile);
router.delete('/api/atg-files/:id', atgFileController.deleteFile);

module.exports = router;
