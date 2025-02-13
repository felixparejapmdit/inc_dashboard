const mysql = require("mysql2/promise");
const fs = require("fs");

// ✅ Load environment variables properly
require("dotenv").config({ path: __dirname + "/../.env" });

// 🔍 Debug: Check if environment variables are loaded
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log(
  "MYSQL_PASSWORD:",
  process.env.MYSQL_PASSWORD ? "*******" : "NOT SET"
);
console.log("MYSQL_DATABASE:", process.env.MYSQL_DATABASE);

// ✅ Create MySQL connection pool
const db = mysql.createPool({
  host: "172.20.161.77",
  user: "inc_dashboard_test",
  password: "M@sunur1n",
  database: "ppi",
});

// ✅ Function to fetch only the selected tables
async function getSelectedTables() {
  const selectedTables = ["personnels", "family_members", "suguan", "apps"];
  return selectedTables; // Only return these specific tables
}

// ✅ Function to fetch all tables
async function getAllTables() {
  const [tables] = await db.query("SHOW TABLES");
  return tables.map((table) => Object.values(table)[0]);
}

// ✅ Function to fetch all data from a table
async function getTableData(table) {
  const [rows] = await db.query(`SELECT * FROM ${table}`);
  return rows;
}

// ✅ Main function to export the entire database
async function exportDatabase() {
  try {
    console.log("🔄 Connecting to MySQL database...");

    // Test connection
    const conn = await db.getConnection();
    console.log("✅ Connected to MySQL Database");
    conn.release();

    const tables = await getSelectedTables();
    let dbContent = {};

    for (const table of tables) {
      dbContent[table] = await getTableData(table);
    }

    // ✅ Save as JSON
    fs.writeFileSync(
      "database_export.json",
      JSON.stringify(dbContent, null, 2)
    );
    console.log("✅ Database exported successfully!");
  } catch (error) {
    console.error("❌ Error exporting database:", error);
  }
}

// ✅ Run the export function
exportDatabase();
