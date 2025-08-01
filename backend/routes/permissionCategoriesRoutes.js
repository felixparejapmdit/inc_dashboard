const express = require("express");
const router = express.Router();
const permissionCategoriesController = require("../controllers/permissionCategoriesController");

const verifyToken = require("../middlewares/authMiddleware");

// Routes for managing permission categories
router.get(
  "/api/permission-categories",
  verifyToken,
  permissionCategoriesController.getAllCategories
);
router.get(
  "/api/permission-categories/:id",
  verifyToken,
  permissionCategoriesController.getCategoryById
);
router.post(
  "/api/permission-categories",
  verifyToken,
  permissionCategoriesController.createCategory
);
router.put(
  "/api/permission-categories/:id",
  verifyToken,
  permissionCategoriesController.updateCategory
);
router.delete(
  "/api/permission-categories/:id",
  verifyToken,
  permissionCategoriesController.deleteCategory
);

module.exports = router;
