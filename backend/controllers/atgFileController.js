const ATGFile = require('../models/ATGFile');
const fs = require('fs');
const path = require('path');

// Get all files
exports.getAllFiles = async (req, res) => {
    try {
        const files = await ATGFile.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(files);
    } catch (err) {
        console.error("Error fetching ATG Files:", err);
        res.status(500).json({ error: err.message });
    }
};

// Handle File Upload (Logic is mostly in route middleware, this saves to DB)
exports.saveFileRecord = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { category, uploaded_by } = req.body;
        // Map the file path to a URL accessible from frontend
        // Assuming backend serves 'uploads' folder statically
        const fileUrl = `/uploads/files/${req.file.filename}`;

        const newFile = await ATGFile.create({
            filename: req.file.originalname,
            file_path: fileUrl, // Web accessible path
            file_type: path.extname(req.file.originalname).substring(1), // e.g. 'pdf'
            category: category || 'General',
            uploaded_by: uploaded_by || 'Admin'
        });

        res.json({ success: true, data: newFile });
    } catch (err) {
        console.error("Error saving ATG File record:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get Org Chart (Specific Helper)
exports.getOrgChart = async (req, res) => {
    try {
        const chart = await ATGFile.findOne({
            where: { category: 'OrgChart' },
            order: [['createdAt', 'DESC']]
        });
        if (!chart) return res.status(404).json({ message: "No org chart found" });
        res.json(chart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete File
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const fileRecord = await ATGFile.findByPk(id);

        if (!fileRecord) {
            return res.status(404).json({ message: "File not found" });
        }

        // Try to delete physical file
        // Note: Verify the absolute path logic based on your server setup
        // Assuming 'uploads' is in the root backend folder
        const relativePath = fileRecord.file_path.replace('/uploads/files/', '');
        const absolutePath = path.join(__dirname, '../../uploads/files', relativePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        await fileRecord.destroy();
        res.json({ success: true, message: "File deleted" });
    } catch (err) {
        console.error("Error deleting ATG File:", err);
        res.status(500).json({ error: err.message });
    }
};
