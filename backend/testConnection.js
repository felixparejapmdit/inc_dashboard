require("dotenv").config({ path: "../.env" });
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((error) => {
  if (error) {
    console.error("Connection error:", error);
  } else {
    console.log("Connected to MySQL successfully!");
  }
  connection.end();
});
