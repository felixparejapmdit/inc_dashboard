const express = require("express");
const router = express.Router();
const subsectionsController = require("../controllers/subsectionsController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all subsections
router.get(
  "/api/subsections/",
  verifyToken,
  subsectionsController.getAllSubsections
);

// Get a single subsection by ID
router.get(
  "/api/subsections/:id",
  verifyToken,
  subsectionsController.getSubsectionById
);

// Create a new subsection
router.post(
  "/api/subsections/",
  verifyToken,
  subsectionsController.createSubsection
);

// Update a subsection by ID
router.put(
  "/api/subsections/:id",
  verifyToken,
  subsectionsController.updateSubsection
);

// Delete a subsection by ID
router.delete(
  "/api/subsections/:id",
  verifyToken,
  subsectionsController.deleteSubsection
);

module.exports = router;
