const express = require("express");
const router = express.Router();
const phoneDirectoryController = require("../controllers/phoneDirectoryController");

// Routes for phone directory
router.get(
  "/api/phone-directory",
  phoneDirectoryController.getPhoneDirectories
);
router.post(
  "/api/add_phone-directory",
  phoneDirectoryController.createPhoneDirectory
);
router.put(
  "/api/phone-directory/:id",
  phoneDirectoryController.updatePhoneDirectory
);
router.delete(
  "/api/phone-directory/:id",
  phoneDirectoryController.deletePhoneDirectory
);

module.exports = router;
