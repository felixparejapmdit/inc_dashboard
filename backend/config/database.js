// config/database.js
require("dotenv").config(); // Load environment variables from .env

const { Sequelize } = require("sequelize");

// Create a new Sequelize instance with environment variables
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Database name
  process.env.MYSQL_USER, // Database user
  process.env.MYSQL_PASSWORD, // Database password
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false, // Disable logging; change to console.log for more verbose output
  }
);

// Test the connection function
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection to MySQL has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to MySQL:", error);
  }
}

// Call the test function to check the connection
if (require.main === module) {
  // Only test the connection if this file is executed directly
  testConnection();
}

module.exports = sequelize;
