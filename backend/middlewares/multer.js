const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set the relative path for the avatar folder
const uploadPath = path.join(__dirname, "../uploads/avatar");

// Create the upload folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Upload path created at: ${uploadPath}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Use the relative path
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname.replace(
      /\s+/g,
      "_"
    )}`; // Replace spaces with underscores
    cb(null, uniqueName); // Generate unique filename
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
