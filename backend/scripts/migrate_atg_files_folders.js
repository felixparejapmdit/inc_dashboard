const sequelize = require("../config/database");

const TABLE_NAME = "atg_files";

const columnExists = (columns, columnName) =>
  columns.some((column) => column.Field === columnName);

const getTableColumns = async () => {
  const [columns] = await sequelize.query(`DESCRIBE \`${TABLE_NAME}\``);
  return columns;
};

const ensureAtgFilesTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`${TABLE_NAME}\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`filename\` VARCHAR(255) NOT NULL,
      \`file_path\` VARCHAR(1024) NOT NULL,
      \`file_type\` VARCHAR(50) NULL,
      \`item_type\` VARCHAR(50) NOT NULL DEFAULT 'file',
      \`folder_path\` VARCHAR(1024) NOT NULL DEFAULT '',
      \`category\` VARCHAR(50) DEFAULT 'General',
      \`uploaded_by\` VARCHAR(100) NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

const addOrNormalizeItemTypeColumn = async (columns) => {
  const hasItemType = columnExists(columns, "item_type");
  const hasFileType = columnExists(columns, "file_type");
  const positionClause = hasFileType ? " AFTER `file_type`" : "";

  if (!hasItemType) {
    console.log('Adding "item_type" column to atg_files...');
    await sequelize.query(
      `ALTER TABLE \`${TABLE_NAME}\` ADD COLUMN \`item_type\` VARCHAR(50) NOT NULL DEFAULT 'file'${positionClause}`,
    );
    console.log('Column "item_type" added successfully.');
    return;
  }

  await sequelize.query(
    `UPDATE \`${TABLE_NAME}\` SET \`item_type\` = 'file' WHERE \`item_type\` IS NULL OR \`item_type\` = ''`,
  );

  console.log('Normalizing "item_type" column on atg_files...');
  await sequelize.query(
    `ALTER TABLE \`${TABLE_NAME}\` MODIFY COLUMN \`item_type\` VARCHAR(50) NOT NULL DEFAULT 'file'${positionClause}`,
  );
  console.log('Column "item_type" is ready.');
};

const addOrNormalizeFolderPathColumn = async (columns) => {
  const hasFolderPath = columnExists(columns, "folder_path");
  const positionClause = columnExists(columns, "item_type")
    ? " AFTER `item_type`"
    : "";

  if (!hasFolderPath) {
    console.log('Adding "folder_path" column to atg_files...');
    await sequelize.query(
      `ALTER TABLE \`${TABLE_NAME}\` ADD COLUMN \`folder_path\` VARCHAR(1024) NOT NULL DEFAULT ''${positionClause}`,
    );
    console.log('Column "folder_path" added successfully.');
    return;
  }

  await sequelize.query(
    `UPDATE \`${TABLE_NAME}\` SET \`folder_path\` = '' WHERE \`folder_path\` IS NULL`,
  );

  console.log('Normalizing "folder_path" column on atg_files...');
  await sequelize.query(
    `ALTER TABLE \`${TABLE_NAME}\` MODIFY COLUMN \`folder_path\` VARCHAR(1024) NOT NULL DEFAULT ''${positionClause}`,
  );
  console.log('Column "folder_path" is ready.');
};

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log("Database connection OK.");

    await ensureAtgFilesTable();

    let columns = await getTableColumns();
    await addOrNormalizeItemTypeColumn(columns);

    columns = await getTableColumns();
    await addOrNormalizeFolderPathColumn(columns);

    await sequelize.query(
      `UPDATE \`${TABLE_NAME}\` SET \`item_type\` = 'file' WHERE \`item_type\` IS NULL OR \`item_type\` = ''`,
    );
    await sequelize.query(
      `UPDATE \`${TABLE_NAME}\` SET \`folder_path\` = '' WHERE \`folder_path\` IS NULL`,
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
