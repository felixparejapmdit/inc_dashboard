const sequelize = require("../config/database");

const TABLE_NAME = "apps";
const COLUMN_NAME = "is_active";

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    const [columns] = await sequelize.query(`DESCRIBE \`${TABLE_NAME}\``);
    const statusColumn = columns.find((column) => column.Field === COLUMN_NAME);

    if (!statusColumn) {
      console.log(`Adding "${COLUMN_NAME}" column to ${TABLE_NAME}...`);
      await sequelize.query(
        `ALTER TABLE \`${TABLE_NAME}\` ADD COLUMN \`${COLUMN_NAME}\` TINYINT(1) NOT NULL DEFAULT 1 AFTER \`app_type\``,
      );
      console.log(`Column "${COLUMN_NAME}" added successfully.`);
      return;
    }

    console.log(`Normalizing "${COLUMN_NAME}" column on ${TABLE_NAME}...`);
    await sequelize.query(
      `ALTER TABLE \`${TABLE_NAME}\` MODIFY COLUMN \`${COLUMN_NAME}\` TINYINT(1) NOT NULL DEFAULT 1`,
    );
    console.log(`Column "${COLUMN_NAME}" normalized successfully.`);

    await sequelize.query(
      `UPDATE \`${TABLE_NAME}\` SET \`${COLUMN_NAME}\` = 1 WHERE \`${COLUMN_NAME}\` IS NULL`,
    );
  } catch (error) {
    console.error("Apps status migration failed:", error);
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
