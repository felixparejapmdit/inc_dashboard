const express = require("express");
const router = express.Router();
const subsectionsController = require("../controllers/subsectionsController");

// Get all subsections
router.get("/api/subsections/", subsectionsController.getAllSubsections);

// Get a single subsection by ID
router.get("/api/subsections/:id", subsectionsController.getSubsectionById);

// Create a new subsection
router.post("/api/subsections/", subsectionsController.createSubsection);

// Update a subsection by ID
router.put("/api/subsections/:id", subsectionsController.updateSubsection);

// Delete a subsection by ID
router.delete("/api/subsections/:id", subsectionsController.deleteSubsection);

module.exports = router;
