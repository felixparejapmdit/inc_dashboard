const express = require("express");
const router = express.Router();
const PhoneLocationController = require("../controllers/phonelocationsController"); // Make sure filename matches this!

const verifyToken = require("../middlewares/authMiddleware");

// Get all locations
router.get(
  "/api/phonelocations",
  verifyToken,
  PhoneLocationController.getAllPhoneLocations
);

// Get a single location by ID
router.get(
  "/api/phonelocations/:id",
  verifyToken,
  PhoneLocationController.getPhoneLocationById
);

// Create a new location
router.post(
  "/api/phonelocations",
  verifyToken,
  PhoneLocationController.createPhoneLocation
);

// Update a location by ID
router.put(
  "/api/phonelocations/:id",
  verifyToken,
  PhoneLocationController.updatePhoneLocation
);

// Delete a location by ID
router.delete(
  "/api/phonelocations/:id",
  verifyToken,
  PhoneLocationController.deletePhoneLocation
);

module.exports = router;
