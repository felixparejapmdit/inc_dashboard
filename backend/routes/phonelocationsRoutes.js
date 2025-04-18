const express = require("express");
const router = express.Router();
const PhoneLocationController = require("../controllers/phonelocationsController"); // Make sure filename matches this!

// Get all locations
router.get("/api/phonelocations", PhoneLocationController.getAllPhoneLocations);

// Get a single location by ID
router.get(
  "/api/phonelocations/:id",
  PhoneLocationController.getPhoneLocationById
);

// Create a new location
router.post("/api/phonelocations", PhoneLocationController.createPhoneLocation);

// Update a location by ID
router.put(
  "/api/phonelocations/:id",
  PhoneLocationController.updatePhoneLocation
);

// Delete a location by ID
router.delete(
  "/api/phonelocations/:id",
  PhoneLocationController.deletePhoneLocation
);

module.exports = router;
