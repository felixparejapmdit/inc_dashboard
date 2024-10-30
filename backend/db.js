require("dotenv").config(); // No path specified if .env is in root
//require("dotenv").config({ path: "../.env" });
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "", // Make sure .env has this filled
  database: process.env.MYSQL_DATABASE || "test", // Optional fallback for testing
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
    return;
  }
  console.log("Connected to MySQL database.");
});

module.exports = connection;
