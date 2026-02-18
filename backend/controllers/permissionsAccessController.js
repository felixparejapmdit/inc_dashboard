// controllers/permissionsAccessController.js

const sequelize = require("../config/database"); // Correct import for Sequelize instance
const { QueryTypes } = require("sequelize");

// Fetch permissions for a specific group
exports.getPermissionsByGroup = async (req, res) => {
  const groupId = req.params.groupId;
  console.log(`📡 [Backend] Received request for permissions of group: ${groupId}`);

  try {
    const startTime = Date.now();
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
        AND gpm.group_id = ?
      ORDER BY pc.id ASC, pd.id ASC;
      `,
      {
        replacements: [groupId], // Pass groupId safely
        type: QueryTypes.SELECT,
      }
    );

    const duration = Date.now() - startTime;
    console.log(`✅ [Backend] Permissions for group ${groupId} fetched in ${duration}ms (${permissions.length} items)`);

    res.status(200).json(permissions); // Send fetched permissions
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({
      message: "Error fetching permissions",
      error: error.message,
    });
  }
};
