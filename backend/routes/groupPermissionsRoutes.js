const express = require("express");
const router = express.Router();
const groupPermissionsController = require("../controllers/groupPermissionsController");
const groupApplicationTypesController = require("../controllers/groupApplicationTypesController");

// Adjust routes to remove the assumption of "/api/groups" in the base path

// GET: Fetch all permissions for a group
router.get("/:id/permissions", groupPermissionsController.getGroupPermissions);

// GET: Fetch application type visibility for a group
router.get(
  "/:id/application-types",
  groupApplicationTypesController.getGroupApplicationTypes
);

// PUT: Update permissions for a group
router.put(
  "/:id/permissions",
  groupPermissionsController.updateGroupPermission
);

// PUT: Update one application type visibility for a group
router.put(
  "/:id/application-types/:applicationTypeId",
  groupApplicationTypesController.updateGroupApplicationType
);

module.exports = router;
