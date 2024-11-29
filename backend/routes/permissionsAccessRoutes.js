// routes/permissionsAccessRoutes.js

const express = require("express");
const router = express.Router();
const permissionsAccessController = require("../controllers/permissionsAccessController");

// Fetch permissions for a specific group ID
router.get("/:groupId", permissionsAccessController.getPermissionsByGroup);

module.exports = router;
