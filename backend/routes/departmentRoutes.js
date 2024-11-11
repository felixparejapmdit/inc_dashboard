const express = require("express");
const router = express.Router();
const departmentsController = require("../controllers/departmentsController");

// Get all departments
router.get("/api/departments", departmentsController.getAllDepartments);

// Get a single department by ID
router.get("/api/departments/:id", departmentsController.getDepartmentById);

// Create a new department
router.post("/api/departments/", departmentsController.createDepartment);

// Update a department by ID
router.put("/api/departments/:id", departmentsController.updateDepartment);

// Delete a department by ID
router.delete("/api/departments/:id", departmentsController.deleteDepartment);

module.exports = router;
