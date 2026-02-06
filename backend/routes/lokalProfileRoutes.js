const express = require("express");
const router = express.Router();
const LokalProfileController = require("../controllers/lokalProfileController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/local");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/api/lokal_profiles", LokalProfileController.getAllProfiles);
router.get("/api/lokal_profiles/:id", LokalProfileController.getProfileById);
router.post("/api/lokal_profiles", upload.single('image'), LokalProfileController.createProfile);
router.put("/api/lokal_profiles/:id", upload.single('image'), LokalProfileController.updateProfile);
router.delete("/api/lokal_profiles/:id", LokalProfileController.deleteProfile);

module.exports = router;
