const express = require("express");
const router = express.Router();
const sectionsController = require("../controllers/sectionsController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all sections
router.get("/api/sections/", verifyToken, sectionsController.getAllSections);

// Get a single section by ID
router.get("/api/sections/:id", verifyToken, sectionsController.getSectionById);

// Create a new section
router.post("/api/sections/", verifyToken, sectionsController.createSection);

// Update a section by ID
router.put("/api/sections/:id", verifyToken, sectionsController.updateSection);

// Delete a section by ID
router.delete(
  "/api/sections/:id",
  verifyToken,
  sectionsController.deleteSection
);

module.exports = router;
