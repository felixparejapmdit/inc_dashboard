const express = require("express");
const router = express.Router();

const personnelImageController = require("../controllers/personnelImageController");

// Create image
router.post("/api/personnel_images", personnelImageController.createImage);

// Get images by personnel_id
router.get(
  "/api/personnel_images/:personnel_id",
  personnelImageController.getImagesByPersonnelId
);

module.exports = router;
