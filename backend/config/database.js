// config/database.js
require("dotenv").config(); // Load environment variables from .env

const { Sequelize } = require("sequelize");

// Create a new Sequelize instance with environment variables
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: console.log, // Enable logging to see SQL queries, remove or adjust as needed
  }
);

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection to MySQL has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to MySQL:", error);
  }
}

testConnection(); // Call the test function to check the connection

module.exports = sequelize;
