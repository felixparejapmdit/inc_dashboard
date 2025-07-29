const express = require("express");
const router = express.Router();
const phoneDirectoryController = require("../controllers/phoneDirectoryController");

const verifyToken = require("../middlewares/authMiddleware");

// Routes for phone directory
router.get(
  "/api/phone-directory",
  verifyToken,
  phoneDirectoryController.getPhoneDirectories
);

router.get(
  "/api/phone-directory/names",
  verifyToken,
  phoneDirectoryController.getUniqueNames
);

router.post(
  "/api/import-phone-directory",
  verifyToken,
  phoneDirectoryController.importPhoneDirectory
);

router.post(
  "/api/add_phone-directory",
  verifyToken,
  phoneDirectoryController.createPhoneDirectory
);
router.put(
  "/api/phone-directory/:id",
  verifyToken,
  phoneDirectoryController.updatePhoneDirectory
);
router.delete(
  "/api/phone-directory/:id",
  verifyToken,
  phoneDirectoryController.deletePhoneDirectory
);

module.exports = router;
