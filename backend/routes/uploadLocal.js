const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/files");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload-local", upload.single("file"), (req, res) => {
  console.log("✅ /api/upload-local hit"); // for debug
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/files/${req.file.filename}`;
  res.json({
    id: req.file.filename,
    url: fileUrl,
    type: req.file.mimetype,
  });
});

module.exports = router;
