const express = require("express");
const router = express.Router();
const permissionCategoriesController = require("../controllers/permissionCategoriesController");

// Routes for managing permission categories
router.get(
  "/api/permission-categories",
  permissionCategoriesController.getAllCategories
);
router.get(
  "/api/permission-categories/:id",
  permissionCategoriesController.getCategoryById
);
router.post(
  "/api/permission-categories",
  permissionCategoriesController.createCategory
);
router.put(
  "/api/permission-categories/:id",
  permissionCategoriesController.updateCategory
);
router.delete(
  "/api/permission-categories/:id",
  permissionCategoriesController.deleteCategory
);

module.exports = router;
