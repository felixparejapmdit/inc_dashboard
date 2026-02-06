require("dotenv").config(); // Load environment variables from .env
const { Sequelize } = require("sequelize");

// Create a new Sequelize instance with environment variables
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Database name
  process.env.MYSQL_USER, // Database user
  process.env.MYSQL_PASSWORD, // Database password
  {
    host: process.env.MYSQL_HOST, // Database host
    port: process.env.MYSQL_PORT || 3307, // Use a default port if not provided
    dialect: "mysql", // Specify MySQL as the dialect
    logging: process.env.NODE_ENV === "development" ? console.log : false, // Enable logging only in development
    dialectOptions:
    {
      connectTimeout: 10000, // Set a timeout for the connection
      allowPublicKeyRetrieval: true
    },
    pool: {
      max: 5, // Maximum number of connections in the pool
      min: 0, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (ms) to acquire a connection before throwing an error
      idle: 10000, // Time (ms) a connection can be idle before being released
    },
  }
);

module.exports = sequelize;
