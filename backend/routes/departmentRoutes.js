const express = require("express");
const router = express.Router();
const departmentsController = require("../controllers/departmentsController");
const verifyToken = require("../middlewares/authMiddleware");

// Get all departments
router.get(
  "/api/departments",
  verifyToken,
  departmentsController.getAllDepartments
);

// Get a single department by ID
router.get(
  "/api/departments/:id",
  verifyToken,
  departmentsController.getDepartmentById
);

// Create a new department
router.post(
  "/api/departments/",
  verifyToken,
  departmentsController.createDepartment
);

// Update a department by ID
router.put(
  "/api/departments/:id",
  verifyToken,
  departmentsController.updateDepartment
);

// Delete a department by ID
router.delete(
  "/api/departments/:id",
  verifyToken,
  departmentsController.deleteDepartment
);

module.exports = router;
