const express = require("express");
const router = express.Router();
const sectionsController = require("../controllers/sectionsController");

// Get all sections
router.get("/api/sections/", sectionsController.getAllSections);

// Get a single section by ID
router.get("/api/sections/:id", sectionsController.getSectionById);

// Create a new section
router.post("/api/sections/", sectionsController.createSection);

// Update a section by ID
router.put("/api/sections/:id", sectionsController.updateSection);

// Delete a section by ID
router.delete("/api/sections/:id", sectionsController.deleteSection);

module.exports = router;
