// routes/personnelGovIDsRoutes.js
const express = require("express");
const router = express.Router();
const PersonnelGovIDController = require("../controllers/PersonnelGovIDController");

// Get all personnel government IDs
router.get("/api/personnel-gov-ids", PersonnelGovIDController.getAllGovIDs);

// Get a specific personnel government ID by ID
router.get("/api/personnel-gov-ids/:id", PersonnelGovIDController.getGovIDById);

// Add a new personnel government ID
router.post("/api/personnel-gov-ids", PersonnelGovIDController.createGovID);

// Update an existing personnel government ID
router.put("/api/personnel-gov-ids/:id", PersonnelGovIDController.updateGovID);

// Delete a personnel government ID
router.delete("/api/personnel-gov-ids/:id", PersonnelGovIDController.deleteGovID);

module.exports = router;
