const sequelize = require("../config/database");

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    const [columns] = await sequelize.query("DESCRIBE apps");
    const iconColumn = columns.find((column) => column.Field === "icon");

    if (!iconColumn) {
      console.warn('Column "icon" not found on apps table.');
      return;
    }

    const columnType = String(iconColumn.Type || "").toLowerCase();
    if (!columnType.includes("longtext")) {
      console.log('Upgrading apps.icon to LONGTEXT...');
      await sequelize.query("ALTER TABLE apps MODIFY COLUMN icon LONGTEXT NULL");
      console.log('Column "icon" upgraded to LONGTEXT successfully.');
    } else {
      console.log('Column "icon" is already LONGTEXT.');
    }
  } catch (error) {
    console.error("Apps icon migration failed:", error);
    if (shouldClose) process.exit(1);
  } finally {
    if (shouldClose) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  migrate(true);
} else {
  module.exports = migrate;
}
