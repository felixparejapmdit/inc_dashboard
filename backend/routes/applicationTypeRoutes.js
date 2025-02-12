const express = require("express");
const router = express.Router();
const applicationTypeController = require("../controllers/applicationTypeController");

// CRUD routes for Application Types
router.get(
  "/api/application-types",
  applicationTypeController.getApplicationTypes
);
router.post(
  "/api/add_application-types",
  applicationTypeController.createApplicationType
);
router.put(
  "/api/application-types/:id",
  applicationTypeController.updateApplicationType
);
router.delete(
  "/api/application-types/:id",
  applicationTypeController.deleteApplicationType
);

module.exports = router;
