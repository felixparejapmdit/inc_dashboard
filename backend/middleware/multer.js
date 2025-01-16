const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set the absolute path to the avatar folder
const uploadPath = path.join(
  "C:\\Users\\felix\\Documents\\GitHub\\inc_dashboard\\uploads\\avatar"
);

// Create the upload folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Use the absolute path
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
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
