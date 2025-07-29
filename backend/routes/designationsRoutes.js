const express = require("express");
const router = express.Router();
const designationsController = require("../controllers/designationsController");
const verifyToken = require("../middlewares/authMiddleware");

// Get all designations
router.get(
  "/api/designations",
  verifyToken,
  designationsController.getAllDesignations
);

// Get a single designation by ID
router.get(
  "/api/designations/:id",
  verifyToken,
  designationsController.getDesignationById
);

// Create a new designation
router.post(
  "/api/designations/",
  verifyToken,
  designationsController.createDesignation
);

// Update a designation by ID
router.put(
  "/api/designations/:id",
  verifyToken,
  designationsController.updateDesignation
);

// Delete a designation by ID
router.delete(
  "/api/designations/:id",
  verifyToken,
  designationsController.deleteDesignation
);

module.exports = router;
