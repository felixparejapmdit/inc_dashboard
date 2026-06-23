const sequelize = require("../config/database");

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS group_application_type_mappings (
        id INT NOT NULL AUTO_INCREMENT,
        group_id BIGINT(20) NOT NULL,
        application_type_id INT NOT NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_group_application_type (group_id, application_type_id),
        CONSTRAINT fk_group_application_type_group
          FOREIGN KEY (group_id) REFERENCES user_groups(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_group_application_type_application_type
          FOREIGN KEY (application_type_id) REFERENCES applicationtypes(id)
          ON DELETE CASCADE
      )
    `);

    const [columns] = await sequelize.query("DESCRIBE group_application_type_mappings");
    const hasIsVisible = columns.some((column) => column.Field === "is_visible");

    if (!hasIsVisible) {
      console.log('Adding "is_visible" column to group_application_type_mappings...');
      await sequelize.query(
        "ALTER TABLE group_application_type_mappings ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1",
      );
    }

    console.log("Group application type visibility migration completed.");
  } catch (error) {
    console.error("Group application type visibility migration failed:", error);
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
