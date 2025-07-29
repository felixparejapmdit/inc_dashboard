const express = require("express");
const router = express.Router();
const applicationTypeController = require("../controllers/applicationTypeController");

const verifyToken = require("../middlewares/authMiddleware");

// CRUD routes for Application Types
router.get(
  "/api/application-types", verifyToken,
  applicationTypeController.getApplicationTypes
);
router.post(
  "/api/add_application-types",verifyToken,
  applicationTypeController.createApplicationType
);
router.put(
  "/api/application-types/:id",verifyToken,
  applicationTypeController.updateApplicationType
);
router.delete(
  "/api/application-types/:id",verifyToken,
  applicationTypeController.deleteApplicationType
);

module.exports = router;
