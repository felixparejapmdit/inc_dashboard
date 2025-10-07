require("dotenv").config(); // Load environment variables from .env
const { Sequelize } = require("sequelize");

// Detect correct host depending on environment
const host =
  process.env.NODE_ENV === "docker"
    ? process.env.MYSQL_HOST || "db" // Docker Compose service name (e.g., db)
    : process.env.MYSQL_HOST || "127.0.0.1"; // Local XAMPP default

// Detect correct port (default MySQL = 3306)
const port = process.env.MYSQL_PORT || 3306;

// Create a new Sequelize instance with environment variables
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Database name
  process.env.MYSQL_USER, // Database user
  process.env.MYSQL_PASSWORD, // Database password
  {
    host,
    port,
    dialect: "mysql", // Specify MySQL as the dialect
    logging: process.env.NODE_ENV === "development" ? console.log : false, // Enable logging only in dev
    dialectOptions: {
      connectTimeout: 10000, // Set a timeout for the connection
    },
    pool: {
      max: 5, // Maximum number of connections in the pool
      min: 0, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (ms) to acquire a connection before throwing an error
      idle: 10000, // Time (ms) a connection can be idle before being released
    },
  }
);

// Optional test function for manual debugging
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection to MySQL has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    console.error("Details:", error); // Full error details
    process.exit(1);
  }
}

// Run connection test only if executed directly
if (require.main === module) {
  testConnection();
}

module.exports = sequelize;
