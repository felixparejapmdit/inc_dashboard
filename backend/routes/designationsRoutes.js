const express = require("express");
const router = express.Router();
const designationsController = require("../controllers/designationsController");

// Get all designations
router.get("/api/designations", designationsController.getAllDesignations);

// Get a single designation by ID
router.get("/api/designations/:id", designationsController.getDesignationById);

// Create a new designation
router.post("/api/designations/", designationsController.createDesignation);

// Update a designation by ID
router.put("/api/designations/:id", designationsController.updateDesignation);

// Delete a designation by ID
router.delete(
  "/api/designations/:id",
  designationsController.deleteDesignation
);

module.exports = router;
