const sequelize = require("../config/database");

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    const [columns] = await sequelize.query("DESCRIBE atg_files");
    const hasItemType = columns.some((column) => column.Field === "item_type");
    const hasFolderPath = columns.some((column) => column.Field === "folder_path");

    if (!hasItemType) {
      console.log('Adding "item_type" column to atg_files...');
      await sequelize.query(
        "ALTER TABLE atg_files ADD COLUMN item_type VARCHAR(20) NOT NULL DEFAULT 'file'",
      );
      console.log('Column "item_type" added successfully.');
    } else {
      console.log('Column "item_type" already exists.');
    }

    if (!hasFolderPath) {
      console.log('Adding "folder_path" column to atg_files...');
      await sequelize.query(
        "ALTER TABLE atg_files ADD COLUMN folder_path VARCHAR(1024) NOT NULL DEFAULT ''",
      );
      console.log('Column "folder_path" added successfully.');
    } else {
      console.log('Column "folder_path" already exists.');
    }

    await sequelize.query(
      "UPDATE atg_files SET item_type = 'file' WHERE item_type IS NULL OR item_type = ''",
    );
    await sequelize.query(
      "UPDATE atg_files SET folder_path = '' WHERE folder_path IS NULL",
    );

    console.log("ATG files folder migration completed.");
  } catch (error) {
    console.error("ATG files folder migration failed:", error);
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

