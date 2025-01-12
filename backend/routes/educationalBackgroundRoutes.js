const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const controller = require("../controllers/EducationalBackgroundController");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/certificates"); // Adjusted path
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate unique filenames
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Get all educational backgrounds
router.get(
  "/api/educational-backgrounds",
  controller.getAllEducationalBackgrounds
);

// Add a new educational background
router.post(
  "/api/educational-backgrounds",
  controller.addEducationalBackground
);

// Update an existing educational background
router.put(
  "/api/educational-backgrounds/:id",
  controller.updateEducationalBackground
);

// Delete an educational background
router.delete(
  "/api/educational-backgrounds/:id",
  controller.deleteEducationalBackground
);

// Upload certificates
router.post(
  "/api/upload-certificates",
  upload.array("certificates", 5), // Allow up to 5 files
  controller.uploadCertificates
);

// Update educational background with certificates
router.put(
  "/api/educational-backgrounds/:id/with-certificates",
  controller.updateEducationalBackgroundWithCertificates
);

// Update certificate_files to remove a certificate
router.put(
  "/api/remove-certificate",
  controller.removeCertificate
);


module.exports = router;
