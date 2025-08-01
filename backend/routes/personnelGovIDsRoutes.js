// routes/personnelGovIDsRoutes.js
const express = require("express");
const router = express.Router();
const PersonnelGovIDController = require("../controllers/PersonnelGovIDController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all personnel government IDs
router.get(
  "/api/personnel-gov-ids",
  verifyToken,
  PersonnelGovIDController.getAllGovIDs
);

// Get a specific personnel government ID by ID
router.get(
  "/api/personnel-gov-ids/:id",
  verifyToken,
  PersonnelGovIDController.getGovIDById
);

// Add a new personnel government ID
router.post(
  "/api/personnel-gov-ids",
  verifyToken,
  PersonnelGovIDController.createGovID
);

// Update an existing personnel government ID
router.put(
  "/api/personnel-gov-ids/:id",
  verifyToken, // Correct route
  PersonnelGovIDController.updateGovID
);

// Delete a personnel government ID
router.delete(
  "/api/personnel-gov-ids/:id",
  verifyToken,
  PersonnelGovIDController.deleteGovID
);

module.exports = router;
