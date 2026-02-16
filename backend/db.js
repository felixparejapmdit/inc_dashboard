require("dotenv").config(); // Load environment variables from .env

const mysql = require("mysql2");

// Create MySQL connection pool with fallback defaults
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "portal_dev",
  password: process.env.MYSQL_PASSWORD || "M@sunur1n",
  database: process.env.MYSQL_DATABASE || "ppi",
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection((error, conn) => {
  if (error) {
    console.error("❌ Error connecting to MySQL:", error.message);
    console.error(
      "❌ Ensure that the database server is running and accessible."
    );
    // process.exit(1); // Do not exit, allow nodemon to stay alive or app to retry on next request
  } else {
    console.log("✅ Connected to MySQL database successfully.");
    conn.release();
  }
});

// Add connection termination for cleanup
process.on("SIGINT", () => {
  pool.end((err) => {
    if (err) {
      console.error("Error during MySQL connection termination:", err.message);
    } else {
      console.log("MySQL connection pool closed.");
    }
    process.exit(0); // Exit the process gracefully
  });
});

module.exports = pool;
