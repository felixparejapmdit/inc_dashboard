// backend/controllers/permissionsController.js
const PermissionDefinition = require("../models/PermissionDefinition");

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await PermissionDefinition.findAll();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving permissions", error });
  }
};

// Get a single permission by ID
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await PermissionDefinition.findByPk(req.params.id);
    if (!permission)
      return res.status(404).json({ message: "Permission not found" });
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving permission", error });
  }
};

// Create a new permission
exports.createPermission = async (req, res) => {
  try {
    const newPermission = await PermissionDefinition.create(req.body);
    res.status(201).json({
      message: "Permission created successfully",
      permission: newPermission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating permission", error });
  }
};

// Update a permission by ID
exports.updatePermission = async (req, res) => {
  try {
    const permission = await PermissionDefinition.findByPk(req.params.id);
    if (!permission)
      return res.status(404).json({ message: "Permission not found" });

    await permission.update(req.body);
    res.status(200).json({
      message: "Permission updated successfully",
      permission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating permission", error });
  }
};

// Delete a permission by ID
exports.deletePermission = async (req, res) => {
  try {
    const permission = await PermissionDefinition.findByPk(req.params.id);
    if (!permission)
      return res.status(404).json({ message: "Permission not found" });

    await permission.destroy();
    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting permission", error });
  }
};
