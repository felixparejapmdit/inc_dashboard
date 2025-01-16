const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer"); // Import multer middleware
const personnelImageController = require("../controllers/personnelImageController");

// POST route for uploading personnel images
router.post(
  "/api/personnel_images",
  upload.single("image"), // Handle single image upload
  personnelImageController.createImage
);

// GET route for fetching personnel images by personnel_id
router.get(
  "/api/personnel_images/:personnel_id",
  personnelImageController.getImagesByPersonnelId
);

router.delete("/api/personnel_images/:id", personnelImageController.deleteImage);

module.exports = router;
