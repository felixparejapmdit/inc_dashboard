const sequelize = require("../config/database");

const STATUS_CHANGE_PERMISSION = "statuschangetracking.view";
const REFERENCE_PERMISSION = "progresstracking.view";

async function seed(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await sequelize.query(
      `
      INSERT INTO permission_definitions (name, description, created_at, updated_at)
      SELECT :permissionName, 'View Personnel Status Change Tracker', NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM permission_definitions WHERE name = :permissionName
      );
      `,
      { replacements: { permissionName: STATUS_CHANGE_PERMISSION } },
    );

    // Mirror whatever category the existing Progress Tracker permission lives in.
    await sequelize.query(
      `
      INSERT INTO permission_category_mappings (permission_id, category_id, created_at, updated_at)
      SELECT new_pd.id, ref_pcm.category_id, NOW(), NOW()
      FROM permission_category_mappings ref_pcm
      JOIN permission_definitions ref_pd
        ON ref_pd.id = ref_pcm.permission_id
        AND ref_pd.name = :referencePermission
      JOIN permission_definitions new_pd
        ON new_pd.name = :permissionName
      WHERE NOT EXISTS (
        SELECT 1
        FROM permission_category_mappings pcm2
        WHERE pcm2.permission_id = new_pd.id
          AND pcm2.category_id = ref_pcm.category_id
      )
      LIMIT 1;
      `,
      {
        replacements: {
          referencePermission: REFERENCE_PERMISSION,
          permissionName: STATUS_CHANGE_PERMISSION,
        },
      },
    );

    // Grant to every group that already has Progress Tracker access.
    await sequelize.query(
      `
      INSERT INTO group_permission_mappings (group_id, permission_id, category_id, accessrights)
      SELECT existing_ref.group_id, new_permission.id, existing_ref.category_id, 1
      FROM group_permission_mappings existing_ref
      JOIN permission_definitions ref_permission
        ON ref_permission.id = existing_ref.permission_id
        AND ref_permission.name = :referencePermission
      JOIN permission_definitions new_permission
        ON new_permission.name = :permissionName
      WHERE existing_ref.accessrights = 1
        AND NOT EXISTS (
          SELECT 1
          FROM group_permission_mappings existing_new
          WHERE existing_new.group_id = existing_ref.group_id
            AND existing_new.permission_id = new_permission.id
        );
      `,
      {
        replacements: {
          referencePermission: REFERENCE_PERMISSION,
          permissionName: STATUS_CHANGE_PERMISSION,
        },
      },
    );

    console.log("Personnel status change permission seed completed.");
  } catch (error) {
    console.error("Personnel status change permission seed failed:", error);
    if (shouldClose) process.exit(1);
  } finally {
    if (shouldClose) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  seed(true);
} else {
  module.exports = seed;
}
