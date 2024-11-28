const express = require("express");
const router = express.Router();
const groupPermissionsController = require("../controllers/groupPermissionsController");

// Adjust routes to remove the assumption of "/api/groups" in the base path

// GET: Fetch all permissions for a group
router.get("/:id/permissions", groupPermissionsController.getGroupPermissions);

// PUT: Update permissions for a group
router.put(
  "/:id/permissions",
  groupPermissionsController.updateGroupPermission
);

module.exports = router;
