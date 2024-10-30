const fs = require("fs");
const path = require("path");
const db = require("./db"); // Ensure db.js exports the MySQL connection

// Define the path to the JSON file
const appsFilePath = path.join(__dirname, "apps.json");

// Read and parse apps.json
fs.readFile(appsFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading apps.json:", err);
    return;
  }

  let apps;
  try {
    apps = JSON.parse(data);
  } catch (jsonError) {
    console.error("Error parsing JSON data:", jsonError);
    return;
  }

  // Loop through each app and insert it into the MySQL table
  const query =
    "INSERT INTO apps (name, url, description, icon) VALUES (?, ?, ?, ?)";

  apps.forEach((app) => {
    const { name, url, description, icon } = app;
    db.query(query, [name, url, description, icon], (error, results) => {
      if (error) {
        console.error("Error inserting app:", error);
        return;
      }
      console.log(`Inserted app: ${name}`);
    });
  });

  console.log("Migration complete.");
});
