const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Load environment variables properly
require("dotenv").config({ path: __dirname + "/../../.env" });

// Debug: Check if environment variables are loaded
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log(
  "MYSQL_PASSWORD:",
  process.env.MYSQL_PASSWORD ? "*******" : "NOT SET"
);
console.log("MYSQL_DATABASE:", process.env.MYSQL_DATABASE);

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "ppi",
  port: process.env.MYSQL_PORT || 3306,
});

function getTablesFromModels() {
  const modelsDir = path.join(__dirname, "..", "models");
  const ignore = new Set(["index.js", "associations.js", "index - Copy1.js"]);
  let files = [];

  try {
    files = fs
      .readdirSync(modelsDir)
      .filter((file) => file.endsWith(".js") && !ignore.has(file));
  } catch (error) {
    console.warn("Unable to read models directory:", error.message);
    return [];
  }

  const tables = [];
  for (const file of files) {
    try {
      const model = require(path.join(modelsDir, file));
      if (!model) continue;

      const tableNameRaw =
        typeof model.getTableName === "function"
          ? model.getTableName()
          : model.tableName;
      const tableName =
        typeof tableNameRaw === "object" && tableNameRaw?.tableName
          ? tableNameRaw.tableName
          : tableNameRaw;

      if (tableName) tables.push(String(tableName));
    } catch (error) {
      console.warn(`Skipping model ${file}:`, error.message);
    }
  }

  return Array.from(new Set(tables));
}

// Function to fetch all tables
async function getAllTables() {
  const [tables] = await db.query("SHOW TABLES");
  return tables.map((table) => Object.values(table)[0]);
}

// Function to fetch all data from a table
async function getTableData(table) {
  const [rows] = await db.query(`SELECT * FROM ${table}`);
  return rows;
}

// Main function to export the entire database
async function exportDatabase() {
  try {
    console.log("Connecting to MySQL database...");

    // Test connection
    const conn = await db.getConnection();
    console.log("Connected to MySQL Database");
    conn.release();

    const tablesFromModels = getTablesFromModels();
    const tables = tablesFromModels.length
      ? tablesFromModels
      : await getAllTables();

    let dbContent = {};

    console.log(`Exporting ${tables.length} tables...`);

    for (const table of tables) {
      process.stdout.write(`Exporting ${table}... `);
      dbContent[table] = await getTableData(table);
      console.log("Done");
    }

    // Save as JSON in backend root where chatController expects it
    const outputPath = __dirname + "/database_export.json";
    fs.writeFileSync(outputPath, JSON.stringify(dbContent, null, 2));
    console.log("Database exported successfully to:", outputPath);
  } catch (error) {
    console.error("Error exporting database:", error);
  }
}

// Run the export function
exportDatabase();