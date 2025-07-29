const express = require("express");
const router = express.Router();
const LocationController = require("../controllers/locationsController"); // Make sure filename matches this!

const verifyToken = require("../middlewares/authMiddleware");

// Get all locations
router.get("/api/locations", verifyToken, LocationController.getAllLocations);

// Get a single location by ID
router.get(
  "/api/locations/:id",
  verifyToken,
  LocationController.getLocationById
);

// Create a new location
router.post("/api/locations", verifyToken, LocationController.createLocation);

// Update a location by ID
router.put(
  "/api/locations/:id",
  verifyToken,
  LocationController.updateLocation
);

// Delete a location by ID
router.delete(
  "/api/locations/:id",
  verifyToken,
  LocationController.deleteLocation
);

module.exports = router;
