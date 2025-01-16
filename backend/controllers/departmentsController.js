const Department = require("../models/Department");

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [["name", "ASC"]], // Order by 'name' in ascending order
    });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving departments", error });
  }
};
// Get a single department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving department", error });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  console.log("Creating a new department:", req.body); // Debugging log
  try {
    const newDepartment = await Department.create(req.body);
    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Error creating department", error });
  }
};

// Update a department by ID
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    await department.update(req.body);
    res
      .status(200)
      .json({ message: "Department updated successfully", department });
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error });
  }
};

// Delete a department by ID
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    await department.destroy();
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error });
  }
};
