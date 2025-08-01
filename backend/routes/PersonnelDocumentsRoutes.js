const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const personnelDocumentsController = require("../controllers/PersonnelDocumentsController");

const verifyToken = require("../middlewares/authMiddleware");

// Ensure the uploads directory exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save to "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."));
  }
};
// Configure Multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed!"), false);
    }
  },
});

// Route to upload a document
router.post(
  "/api/personnel-documents/upload",
  verifyToken,
  upload.single("file"), // Accept a single file
  personnelDocumentsController.uploadDocument
);

// Route to get documents by personnel ID
router.get(
  "/api/personnel-documents/:personnel_id",
  verifyToken,
  personnelDocumentsController.getDocumentsByPersonnelId
);

module.exports = router;
