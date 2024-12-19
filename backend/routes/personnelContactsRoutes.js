// routes/personnelContactsRoutes.js
const express = require("express");
const router = express.Router();
const PersonnelContactController = require("../controllers/PersonnelContactController");

// Get all personnel contacts (optional filtering by personnel_id)
router.get(
  "/api/get-personnel-contacts",
  PersonnelContactController.getAllContacts
);

// Get a specific personnel contact by ID
router.get(
  "/api/personnel-contacts/:id",
  PersonnelContactController.getContactById
);

// Add a new personnel contact
router.post(
  "/api/personnel-contacts",
  PersonnelContactController.createContact
);

// Update an existing personnel contact
router.put(
  "/api/personnel-contacts/:id",
  PersonnelContactController.updateContact
);

// Delete a personnel contact
router.delete(
  "/api/personnel-contacts/:id",
  PersonnelContactController.deleteContact
);

module.exports = router;
