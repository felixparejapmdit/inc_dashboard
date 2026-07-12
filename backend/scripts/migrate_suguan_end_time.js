const sequelize = require("../config/database");

const TABLE_NAME = "suguan";

const columnExists = (columns, columnName) =>
  columns.some((column) => column.Field === columnName);

const getTableColumns = async () => {
  const [columns] = await sequelize.query(`DESCRIBE \`${TABLE_NAME}\``);
  return columns;
};

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    const columns = await getTableColumns();

    if (!columnExists(columns, "end_time")) {
      console.log(`Adding "end_time" column to ${TABLE_NAME}...`);
      await sequelize.query(
        `ALTER TABLE \`${TABLE_NAME}\` ADD COLUMN \`end_time\` TIME NULL AFTER \`time\``,
      );
      console.log('Column "end_time" added successfully.');
    }

    console.log("Suguan end_time column migration completed.");
  } catch (error) {
    console.error("Suguan end_time column migration failed:", error);
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
