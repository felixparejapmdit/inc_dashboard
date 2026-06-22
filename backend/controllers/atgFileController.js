const ATGFile = require("../models/ATGFile");
const fs = require("fs");
const path = require("path");

const FILES_DIR = path.join(__dirname, "../uploads/files");

const sanitizeFilename = (name) =>
    path
        .basename(String(name || "").trim())
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, " ")
        .trim();

const ensureExtension = (name, extension) => {
    const safeName = sanitizeFilename(name);
    if (!safeName) return "";

    if (path.extname(safeName)) {
        return safeName;
    }

    const normalizedExt = String(extension || "").replace(/^\./, "");
    return normalizedExt ? `${safeName}.${normalizedExt}` : safeName;
};

const resolveStoredFilePath = (filePath) => {
    const storedName = path.basename(String(filePath || ""));
    return storedName ? path.join(FILES_DIR, storedName) : null;
};

const enrichFileRecord = (record) => {
    const plain = record.get ? record.get({ plain: true }) : { ...record };
    const absolutePath = resolveStoredFilePath(plain.file_path);

    if (absolutePath && fs.existsSync(absolutePath)) {
        const stats = fs.statSync(absolutePath);
        plain.file_size = stats.size;
    } else {
        plain.file_size = null;
    }

    plain.download_url = `/api/atg-files/${plain.id}/download`;
    plain.preview_url = plain.file_path;

    return plain;
};

// Get all files
exports.getAllFiles = async (req, res) => {
    try {
        const files = await ATGFile.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(files.map(enrichFileRecord));
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
            file_type: path.extname(req.file.originalname).substring(1).toLowerCase(), // e.g. 'pdf'
            category: category || 'General',
            uploaded_by: uploaded_by || 'Admin'
        });

        res.json({ success: true, data: enrichFileRecord(newFile) });
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

        const absolutePath = resolveStoredFilePath(fileRecord.file_path);

        if (absolutePath && fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        await fileRecord.destroy();
        res.json({ success: true, message: "File deleted" });
    } catch (err) {
        console.error("Error deleting ATG File:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { filename } = req.body;
        const fileRecord = await ATGFile.findByPk(id);

        if (!fileRecord) {
            return res.status(404).json({ message: "File not found" });
        }

        const cleanedName = ensureExtension(filename, fileRecord.file_type);
        if (!cleanedName) {
            return res.status(400).json({ message: "Filename is required" });
        }

        fileRecord.filename = cleanedName;
        await fileRecord.save();

        res.json({ success: true, data: enrichFileRecord(fileRecord) });
    } catch (err) {
        console.error("Error updating ATG File:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const fileRecord = await ATGFile.findByPk(id);

        if (!fileRecord) {
            return res.status(404).json({ message: "File not found" });
        }

        const absolutePath = resolveStoredFilePath(fileRecord.file_path);

        if (!absolutePath || !fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: "File not found on disk" });
        }

        res.download(absolutePath, fileRecord.filename || path.basename(absolutePath));
    } catch (err) {
        console.error("Error downloading ATG File:", err);
        res.status(500).json({ error: err.message });
    }
};
