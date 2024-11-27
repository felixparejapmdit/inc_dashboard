// backend/routes/permissionRoutes.js
const express = require("express");
const router = express.Router();
const permissionsController = require("../controllers/permissionsController");
const categoriesController = require("../controllers/permissionCategoriesController"); // Import the categories controller

// Permissions Routes

// Get all permissions
router.get("/api/permissions/", permissionsController.getAllPermissions);


// Get a single permission by ID
router.get("/api/permissions/:id", permissionsController.getPermissionById);

// Create a new permission
router.post("/api/permissions/", permissionsController.createPermission);
// Update a permission by ID
router.put("/api/permissions/:id", permissionsController.updatePermission);
// Update a permission's category
router.put(
  "/api/permissions/:id/category",
  permissionsController.updatePermissionCategory
);

// Delete a permission by ID
router.delete("/api/permissions/:id", permissionsController.deletePermission);

module.exports = router;
