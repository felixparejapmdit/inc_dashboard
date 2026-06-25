const sequelize = require("../config/database");

async function seed(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    const queryInterface = sequelize.getQueryInterface();
    const tableDefinition = await queryInterface.describeTable("users");

    if (!tableDefinition.webdav_url) {
      await sequelize.query(
        `
        ALTER TABLE users
        ADD COLUMN webdav_url VARCHAR(500) NULL AFTER username;
        `,
      );
      console.log("✅ users.webdav_url column added successfully.");
    } else {
      console.log("✅ users.webdav_url column already exists.");
    }
  } catch (error) {
    console.error("users.webdav_url migration failed:", error);
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
