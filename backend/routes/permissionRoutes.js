// backend/routes/permissionRoutes.js
const express = require("express");
const router = express.Router();
const permissionsController = require("../controllers/permissionsController");

// Get all permissions
router.get("/api/permissions/", permissionsController.getAllPermissions);

// Get a single permission by ID
router.get("/api/permissions/:id", permissionsController.getPermissionById);

// Create a new permission
router.post("/api/permissions/", permissionsController.createPermission);

// Update a permission by ID
router.put("/api/permissions/:id", permissionsController.updatePermission);

// Delete a permission by ID
router.delete("/api/permissions/:id", permissionsController.deletePermission);

module.exports = router;
