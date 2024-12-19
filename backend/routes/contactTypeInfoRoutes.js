const express = require("express");
const router = express.Router();
const contactTypeInfoController = require("../controllers/ContactTypeInfoController");

// Route to get all contact types
router.get(
  "/api/contact-type-info",
  contactTypeInfoController.getAllContactTypes
);

// Route to get contact types by personnel_id
router.get(
  "/api/contact-type-info/personnel",
  contactTypeInfoController.getContactTypesByPersonnelId
);

// Route to add a new contact type
router.post("/api/contact-type-info", contactTypeInfoController.addContactType);

// Route to update an existing contact type by ID
router.put(
  "/api/contact-type-info/:id",
  contactTypeInfoController.updateContactType
);

// Route to delete a contact type by ID
router.delete(
  "/api/contact-type-info/:id",
  contactTypeInfoController.deleteContactType
);

module.exports = router;
