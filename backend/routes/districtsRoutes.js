const express = require("express");
const router = express.Router();

const districtsController = require("../controllers/districtController");

const verifyToken = require("../middlewares/authMiddleware");

// Import Districts
router.post("/api/import-districts", verifyToken, districtsController.importDistricts);

// Get all districts
router.get("/api/districts", verifyToken, districtsController.getAllDistricts);

// Get a single district by ID
router.get("/api/districts/:id", verifyToken, districtsController.getDistrictById);

// Create a new district
router.post("/api/districts", verifyToken, districtsController.createDistrict);

// Update a district by ID
router.put("/api/districts/:id", verifyToken, districtsController.updateDistrict);

// Delete a district by ID
router.delete("/api/districts/:id", verifyToken, districtsController.deleteDistrict);

module.exports = router;
