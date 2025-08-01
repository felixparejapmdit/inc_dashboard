// routes/personnelContactsRoutes.js
const express = require("express");
const router = express.Router();
const PersonnelContactController = require("../controllers/PersonnelContactController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all personnel contacts (optional filtering by personnel_id)
router.get(
  "/api/get-personnel-contacts",verifyToken,
  PersonnelContactController.getAllContacts
);

// Get a specific personnel contact by ID
router.get(
  "/api/personnel-contacts/:id",verifyToken,
  PersonnelContactController.getContactById
);

router.get(
  "/api/personnel-contacts/pid/:personnel_id",verifyToken,
  PersonnelContactController.getContactByPersonnelId
);

// Add a new personnel contact
router.post(
  "/api/personnel-contacts",verifyToken,
  PersonnelContactController.createContact
);

// Update an existing personnel contact
router.put(
  "/api/personnel-contacts/:id",verifyToken,
  PersonnelContactController.updateContact
);

// Delete a personnel contact
router.delete(
  "/api/personnel-contacts/:id",verifyToken,
  PersonnelContactController.deleteContact
);

module.exports = router;
