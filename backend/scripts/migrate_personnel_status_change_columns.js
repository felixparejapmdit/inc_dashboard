const sequelize = require("../config/database");

const PERSONNELS_TABLE = "personnels";
const HISTORY_TABLE = "personnel_activity_logs";
const HISTORY_ACTION_ENUM = "ENUM('In','Out','Transferred','Reassigned')";

const columnExists = (columns, columnName) =>
  columns.some((column) => column.Field === columnName);

const getTableColumns = async (tableName) => {
  const [columns] = await sequelize.query(`DESCRIBE \`${tableName}\``);
  return columns;
};

const addPersonnelStatusColumns = async () => {
  const columns = await getTableColumns(PERSONNELS_TABLE);

  if (!columnExists(columns, "personnel_status")) {
    console.log(`Adding "personnel_status" column to ${PERSONNELS_TABLE}...`);
    await sequelize.query(
      `ALTER TABLE \`${PERSONNELS_TABLE}\` ADD COLUMN \`personnel_status\` VARCHAR(30) NULL DEFAULT 'active' AFTER \`rfid_code\``,
    );
    console.log('Column "personnel_status" added successfully.');
  }

  if (!columnExists(columns, "status_change_progress")) {
    console.log(`Adding "status_change_progress" column to ${PERSONNELS_TABLE}...`);
    await sequelize.query(
      `ALTER TABLE \`${PERSONNELS_TABLE}\` ADD COLUMN \`status_change_progress\` VARCHAR(255) NULL AFTER \`personnel_status\``,
    );
    console.log('Column "status_change_progress" added successfully.');
  }
};

const widenHistoryActionEnum = async () => {
  const columns = await getTableColumns(HISTORY_TABLE);
  const actionColumn = columns.find((column) => column.Field === "action");

  if (actionColumn && !/Transferred/i.test(actionColumn.Type)) {
    console.log(`Widening "action" enum on ${HISTORY_TABLE}...`);
    await sequelize.query(
      `ALTER TABLE \`${HISTORY_TABLE}\` MODIFY COLUMN \`action\` ${HISTORY_ACTION_ENUM} NOT NULL`,
    );
    console.log('Column "action" widened successfully.');
  }
};

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await addPersonnelStatusColumns();
    await widenHistoryActionEnum();

    console.log("Personnel status change column migration completed.");
  } catch (error) {
    console.error("Personnel status change column migration failed:", error);
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
