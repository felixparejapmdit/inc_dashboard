const sequelize = require("../config/database");

const PLUGINS_CATEGORY = "Plugins";
const WEB_DAV_PERMISSION = "webdav.view";
const PLUGINS_PERMISSION = "*plugins.view";

async function seed(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await sequelize.query(
      `
      INSERT INTO permission_categories (name, description, created_at, updated_at)
      SELECT :categoryName, 'View Plugins', NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM permission_categories WHERE name = :categoryName
      );
      `,
      { replacements: { categoryName: PLUGINS_CATEGORY } },
    );

    await sequelize.query(
      `
      INSERT INTO permission_definitions (name, description, created_at, updated_at)
      SELECT :permissionName, 'View WebDAV Drive', NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM permission_definitions WHERE name = :permissionName
      );
      `,
      { replacements: { permissionName: WEB_DAV_PERMISSION } },
    );

    await sequelize.query(
      `
      INSERT INTO permission_category_mappings (permission_id, category_id, created_at, updated_at)
      SELECT pd.id, pc.id, NOW(), NOW()
      FROM permission_definitions pd
      JOIN permission_categories pc ON pc.name = :categoryName
      WHERE pd.name = :permissionName
        AND NOT EXISTS (
          SELECT 1
          FROM permission_category_mappings pcm
          WHERE pcm.permission_id = pd.id
            AND pcm.category_id = pc.id
        );
      `,
      {
        replacements: {
          categoryName: PLUGINS_CATEGORY,
          permissionName: WEB_DAV_PERMISSION,
        },
      },
    );

    await sequelize.query(
      `
      INSERT INTO group_permission_mappings (group_id, permission_id, category_id, accessrights)
      SELECT existing_plugins.group_id, webdav_permission.id, plugin_category.id, 1
      FROM group_permission_mappings existing_plugins
      JOIN permission_definitions plugins_permission
        ON plugins_permission.id = existing_plugins.permission_id
        AND plugins_permission.name = :pluginsPermission
      JOIN permission_definitions webdav_permission
        ON webdav_permission.name = :webdavPermission
      JOIN permission_categories plugin_category
        ON plugin_category.name = :categoryName
      WHERE existing_plugins.accessrights = 1
        AND NOT EXISTS (
          SELECT 1
          FROM group_permission_mappings existing_webdav
          WHERE existing_webdav.group_id = existing_plugins.group_id
            AND existing_webdav.permission_id = webdav_permission.id
        );
      `,
      {
        replacements: {
          categoryName: PLUGINS_CATEGORY,
          pluginsPermission: PLUGINS_PERMISSION,
          webdavPermission: WEB_DAV_PERMISSION,
        },
      },
    );

    console.log("WebDAV plugin permission seed completed.");
  } catch (error) {
    console.error("WebDAV plugin permission seed failed:", error);
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
