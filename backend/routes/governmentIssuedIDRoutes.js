const express = require("express");
const router = express.Router();
const governmentIssuedIDController = require("../controllers/GovernmentIssuedIDController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all government-issued IDs
router.get(
  "/api/government-issued-ids",
  verifyToken,
  governmentIssuedIDController.getAllGovernmentIssuedIDs
);

// Add a new government-issued ID
router.post(
  "/api/government-issued-ids",
  verifyToken,
  governmentIssuedIDController.addGovernmentID
);

// Update an existing government-issued ID by ID
router.put(
  "/api/government-issued-ids/:id",
  verifyToken,
  governmentIssuedIDController.updateGovernmentID
);

// Delete a government-issued ID by ID
router.delete(
  "/api/government-issued-ids/:id",
  verifyToken,
  governmentIssuedIDController.deleteGovernmentID
);

module.exports = router;
