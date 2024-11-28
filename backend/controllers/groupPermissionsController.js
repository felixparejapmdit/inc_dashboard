const {
  Group,
  PermissionDefinition,
  PermissionCategory,
  GroupPermissionMapping,
} = require("../models");
const { sequelize } = require("../models");
// Get permissions for a specific group
exports.getGroupPermissions = async (req, res) => {
  const groupId = req.params.id;

  try {
    const permissions = await sequelize.query(
      `
      SELECT 
        pc.id AS category_id,
        pc.name AS category_name,
        pd.id AS permission_id,
        pd.name AS permission_name,
        pd.description AS permission_description,
        COALESCE(gpm.accessrights, 0) AS accessrights
      FROM permission_categories pc
      LEFT JOIN permission_category_mappings pcm ON pcm.category_id = pc.id
      LEFT JOIN permission_definitions pd ON pd.id = pcm.permission_id
      LEFT JOIN group_permission_mappings gpm 
        ON gpm.permission_id = pd.id 
        AND gpm.group_id = :groupId
      ORDER BY pc.id ASC, pd.id ASC;
      `,
      {
        replacements: { groupId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!permissions.length) {
      return res.status(404).json({ message: "No permissions found" });
    }

    // Group permissions by category for better structuring
    const groupedPermissions = permissions.reduce((acc, row) => {
      const {
        category_id,
        category_name,
        permission_id,
        permission_name,
        permission_description,
        accessrights,
      } = row;

      if (!acc[category_id]) {
        acc[category_id] = {
          categoryId: category_id,
          categoryName: category_name,
          permissions: [],
        };
      }

      acc[category_id].permissions.push({
        id: permission_id,
        name: permission_name,
        description: permission_description,
        accessrights,
      });

      return acc;
    }, {});

    // Convert the grouped permissions into an array
    const formattedPermissions = Object.values(groupedPermissions);

    res.status(200).json(formattedPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};

// Update permissions for a specific group
exports.updateGroupPermission = async (req, res) => {
  const groupId = req.params.id;
  const { permissionId, categoryId, accessrights } = req.body;

  // Validate input
  if (!permissionId || !categoryId || accessrights === undefined) {
    return res
      .status(400)
      .json({ message: "Invalid request body. All fields are required." });
  }

  try {
    // Validate group existence
    const groupExists = await Group.findByPk(groupId);
    if (!groupExists) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Validate permission existence
    const permissionExists = await PermissionDefinition.findByPk(permissionId);
    if (!permissionExists) {
      return res.status(404).json({ message: "Permission not found." });
    }

    // Validate category existence
    const categoryExists = await PermissionCategory.findByPk(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Find or create the mapping between the group and permission
    const [mapping, created] = await GroupPermissionMapping.findOrCreate({
      where: { group_id: groupId, permission_id: permissionId },
      defaults: { category_id: categoryId, accessrights },
    });

    // Update access rights if the mapping already exists
    if (!created) {
      mapping.accessrights = accessrights;
      await mapping.save();
    }

    res.status(200).json({
      message: "Permission updated successfully",
      updatedPermission: mapping,
    });
  } catch (error) {
    console.error("Error updating group permission:", error.message);
    res
      .status(500)
      .json({ message: "Error updating permission", error: error.message });
  }
};
