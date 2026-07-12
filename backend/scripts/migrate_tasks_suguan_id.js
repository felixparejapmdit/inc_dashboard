const sequelize = require("../config/database");

const TABLE_NAME = "tasks";

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

    if (!columnExists(columns, "suguan_id")) {
      console.log(`Adding "suguan_id" column to ${TABLE_NAME}...`);
      await sequelize.query(
        `ALTER TABLE \`${TABLE_NAME}\` ADD COLUMN \`suguan_id\` INT NULL AFTER \`category_id\``,
      );
      await sequelize.query(
        `ALTER TABLE \`${TABLE_NAME}\` ADD UNIQUE INDEX \`idx_tasks_suguan_id\` (\`suguan_id\`)`,
      );
      console.log('Column "suguan_id" added successfully.');
    }

    console.log("Tasks suguan_id column migration completed.");
  } catch (error) {
    console.error("Tasks suguan_id column migration failed:", error);
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
