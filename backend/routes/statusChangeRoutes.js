const express = require("express");
const router = express.Router();
const statusChangeController = require("../controllers/statusChangeController");
const verifyToken = require("../middlewares/authMiddleware");

// Get personnel currently in a removal case at a given clearance stage
router.get("/api/personnels/status-change/:step", verifyToken, statusChangeController.getPersonnelsByStatusChangeProgress);

// Start a removal case
router.post("/api/personnels/:id/initiate-removal", verifyToken, statusChangeController.initiateRemoval);

// Advance/revert the removal clearance stage
router.put("/api/personnels/update-removal-progress", verifyToken, statusChangeController.updateRemovalProgress);

// Close out a removal case (soft-deletes the personnel record)
router.post("/api/personnels/:id/finalize-removal", verifyToken, statusChangeController.finalizeRemoval);

// Apply a transfer or reassignment
router.post("/api/personnels/:id/transfer", verifyToken, statusChangeController.applyTransfer);

module.exports = router;
