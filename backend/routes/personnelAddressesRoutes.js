// routes/personnelAddressesRoutes.js
const express = require("express");
const router = express.Router();
const PersonnelAddressController = require("../controllers/PersonnelAddressController");

// Get all personnel addresses
router.get(
  "/api/personnel-addresses",
  PersonnelAddressController.getAllAddresses
);

// Get all addresses with address_type = 'INC Housing'
router.get(
  "/api/personnel-addresses/inc-housing",
  PersonnelAddressController.getIncHousingAddresses
);

// Get a specific personnel address by ID
router.get(
  "/api/personnel-addresses/:id",
  PersonnelAddressController.getAddressById
);

// Get a specific personnel address by personnel id
router.get(
  "/api/personnel-addresses/pid/:personnel_id",
  PersonnelAddressController.getAddressByPersonnelId
);

// Add a new personnel address
router.post(
  "/api/personnel-addresses",
  PersonnelAddressController.createAddress
);

// Update an existing personnel address
router.put(
  "/api/personnel-addresses/:id",
  PersonnelAddressController.updateAddress
);

// Delete a personnel address
router.delete(
  "/api/personnel-addresses/:id",
  PersonnelAddressController.deleteAddress
);

module.exports = router;
