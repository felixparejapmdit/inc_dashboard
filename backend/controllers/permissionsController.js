// backend/controllers/permissionsController.js
const PermissionDefinition = require("../models/PermissionDefinition");
const PermissionCategory = require("../models/PermissionCategory");
const PermissionCategoryMapping = require("../models/PermissionCategoryMapping");
const sequelize = require("../config/database"); // Ensure Sequelize instance is imported

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const [permissions] = await sequelize.query(`
      SELECT 
        pcm.id as pcm, 
        pd.id as pd, 
        pc.id as pc, 
        pd.name as permissionName, 
        pc.name as categoryName
      FROM 
        permission_category_mappings pcm
      INNER JOIN 
        permission_definitions pd 
        ON pd.id = pcm.permission_id
      INNER JOIN 
        permission_categories pc 
        ON pc.id = pcm.category_id
    `);

    const formattedPermissions = permissions.map((permission) => ({
      id: permission.pd,
      name: permission.permissionName,
      categoryId: permission.pc,
      categoryName: permission.categoryName,
    }));

    res.status(200).json(formattedPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};

// Get all permissions
exports.getAllPermissions1 = async (req, res) => {
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
  const { name, description, categoryId } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ message: "Name and category are required" });
  }

  try {
    // Create the permission
    const newPermission = await PermissionDefinition.create({
      name,
      description,
    });

    // Create the mapping
    await PermissionCategoryMapping.create({
      permission_id: newPermission.id,
      category_id: categoryId,
    });

    res.status(201).json({
      message: "Permission created successfully",
      permission: newPermission,
    });
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ message: "Error creating permission", error });
  }
};

// Update a permission by ID
exports.updatePermission = async (req, res) => {
  const { name, description, categoryId } = req.body;
  const { id } = req.params;

  if (!name || !categoryId) {
    return res.status(400).json({ message: "Name and category are required" });
  }

  try {
    const permission = await PermissionDefinition.findByPk(id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Update permission details
    await permission.update({ name, description });

    // Update or create mapping
    const [mapping, created] = await PermissionCategoryMapping.findOrCreate({
      where: { permission_id: id },
      defaults: { category_id: categoryId },
    });

    if (!created) {
      await mapping.update({ category_id: categoryId });
    }

    res.status(200).json({
      message: "Permission updated successfully",
      permission,
    });
  } catch (error) {
    console.error("Error updating permission:", error);
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

exports.updatePermissionCategory = async (req, res) => {
  try {
    const { permissionId, categoryId } = req.body;

    // Check if mapping exists
    const mapping = await PermissionCategoryMapping.findOne({
      where: { permission_id: permissionId },
    });

    if (mapping) {
      // Update existing mapping
      await mapping.update({ category_id: categoryId });
    } else {
      // Create new mapping
      await PermissionCategoryMapping.create({
        permission_id: permissionId,
        category_id: categoryId,
      });
    }

    res
      .status(200)
      .json({ message: "Permission category updated successfully" });
  } catch (error) {
    console.error("Error updating permission category:", error);
    res
      .status(500)
      .json({ message: "Error updating permission category", error });
  }
};
