require("dotenv").config(); // Load environment variables from .env

const mysql = require("mysql");

// Create MySQL connection with fallback defaults
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || "127.0.0.1", // Fallback to localhost for development
  user: process.env.MYSQL_USER || "portal_dev",
  password: process.env.MYSQL_PASSWORD || "M@sunur1n",
  database: process.env.MYSQL_DATABASE || "ppi",
  port: process.env.MYSQL_PORT || 3306, // Default MySQL port
});

// Establish connection and handle potential errors
connection.connect((error) => {
  if (error) {
    console.error("❌ Error connecting to MySQL:", error.message);
    console.error(
      "❌ Ensure that the database server is running and accessible."
    );
    process.exit(1); // Exit the process with an error
  } else {
    console.log("✅ Connected to MySQL database successfully.");
  }
});

// Add connection termination for cleanup
process.on("SIGINT", () => {
  connection.end((err) => {
    if (err) {
      console.error("Error during MySQL connection termination:", err.message);
    } else {
      console.log("MySQL connection closed.");
    }
    process.exit(0); // Exit the process gracefully
  });
});

module.exports = connection;
