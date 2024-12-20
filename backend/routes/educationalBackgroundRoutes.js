const express = require("express");
const router = express.Router();
const controller = require("../controllers/EducationalBackgroundController");

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

module.exports = router;
