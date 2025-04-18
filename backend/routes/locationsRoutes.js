const express = require("express");
const router = express.Router();
const LocationController = require("../controllers/locationsController"); // Make sure filename matches this!

// Get all locations
router.get("/api/locations", LocationController.getAllLocations);

// Get a single location by ID
router.get("/api/locations/:id", LocationController.getLocationById);

// Create a new location
router.post("/api/locations", LocationController.createLocation);

// Update a location by ID
router.put("/api/locations/:id", LocationController.updateLocation);

// Delete a location by ID
router.delete("/api/locations/:id", LocationController.deleteLocation);

module.exports = router;
