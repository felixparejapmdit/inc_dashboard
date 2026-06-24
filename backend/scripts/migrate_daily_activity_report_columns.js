const sequelize = require("../config/database");

const TABLE_NAME = "daily_activity_reports";

const columnExists = (columns, columnName) =>
  columns.some((column) => column.Field === columnName);

const getTableColumns = async () => {
  const [columns] = await sequelize.query(`DESCRIBE \`${TABLE_NAME}\``);
  return columns;
};

const ensureDailyActivityReportsTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`${TABLE_NAME}\` (
      \`report_id\` INT NOT NULL AUTO_INCREMENT,
      \`user_id\` INT(11) NOT NULL,
      \`report_date\` DATE NOT NULL COMMENT 'Day mapped to the entry',
      \`accomplishments\` TEXT NULL COMMENT 'Natapus na Gawain',
      \`remarks\` TEXT NULL COMMENT 'System or administrative remarks',
      \`personnel_remarks\` TEXT NULL COMMENT 'Remarks ng Personnel',
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`report_id\`),
      KEY \`idx_dar_user_id\` (\`user_id\`),
      KEY \`idx_dar_report_date\` (\`report_date\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

const getPositionClause = (columns, preferredColumns = []) => {
  for (const columnName of preferredColumns) {
    if (columnExists(columns, columnName)) {
      return ` AFTER \`${columnName}\``;
    }
  }

  return "";
};

const addOrNormalizeTextColumn = async (columns, columnName, preferredColumns = []) => {
  const hasColumn = columnExists(columns, columnName);
  const positionClause = getPositionClause(columns, preferredColumns);

  if (!hasColumn) {
    console.log(`Adding "${columnName}" column to ${TABLE_NAME}...`);
    await sequelize.query(
      `ALTER TABLE \`${TABLE_NAME}\` ADD COLUMN \`${columnName}\` TEXT NULL${positionClause}`,
    );
    console.log(`Column "${columnName}" added successfully.`);
    return;
  }

  console.log(`Normalizing "${columnName}" column on ${TABLE_NAME}...`);
  await sequelize.query(
    `ALTER TABLE \`${TABLE_NAME}\` MODIFY COLUMN \`${columnName}\` TEXT NULL${positionClause}`,
  );
  console.log(`Column "${columnName}" is ready.`);
};

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await ensureDailyActivityReportsTable();

    let columns = await getTableColumns();
    await addOrNormalizeTextColumn(columns, "remarks", ["accomplishments", "report_date"]);

    columns = await getTableColumns();
    await addOrNormalizeTextColumn(columns, "personnel_remarks", [
      "remarks",
      "accomplishments",
      "report_date",
    ]);

    console.log("Daily activity report column migration completed.");
  } catch (error) {
    console.error("Daily activity report column migration failed:", error);
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
