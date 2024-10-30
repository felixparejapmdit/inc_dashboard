// backend/migrateUsers.js

const fs = require("fs");
const path = require("path");
const connection = require("./db");

// Path to the users.json file
const usersFilePath = path.join(__dirname, "users.json");

// Read the JSON file and insert data into MySQL
fs.readFile(usersFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading users.json file:", err);
    return;
  }

  const users = JSON.parse(data);

  users.forEach((user) => {
    const {
      avatar,
      name,
      username,
      password,
      email,
      online_status,
      created_at,
      updated_at,
    } = user;

    const query = `
      INSERT INTO users (avatar, fullname, username, password, email, online_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      query,
      [
        avatar,
        name,
        username,
        password,
        email,
        online_status,
        created_at,
        updated_at,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
        } else {
          console.log(`User ${username} inserted with ID: ${result.insertId}`);
        }
      }
    );
  });

  console.log("Migration complete.");
  connection.end();
});
