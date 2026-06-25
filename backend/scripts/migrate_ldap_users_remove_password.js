const sequelize = require("../config/database");

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    const queryInterface = sequelize.getQueryInterface();
    const tableDefinition = await queryInterface.describeTable("LDAP_Users");

    if (tableDefinition.userPassword) {
      await sequelize.query(
        "ALTER TABLE `LDAP_Users` DROP COLUMN `userPassword`;",
      );
      console.log("✅ LDAP_Users.userPassword column removed successfully.");
    } else {
      console.log("✅ LDAP_Users.userPassword column already removed.");
    }
  } catch (error) {
    console.error("LDAP_Users.userPassword migration failed:", error);
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
