const express = require("express");
const router = express.Router();
const {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationsController");

// Routes for locations
router.get("/api/locations", getAllLocations); // Get all locations
router.get("/api/locations/:id", getLocationById); // Get a single location by ID
router.post("/api/locations", createLocation); // Add a new location
router.put("/api/locations/:id", updateLocation); // Update a location by ID
router.delete("/api/locations/:id", deleteLocation); // Delete a location by ID

module.exports = router;
