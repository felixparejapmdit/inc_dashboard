const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Increased limit to handle Base64 images

const appsFilePath = "./apps.json"; // Path to apps.json file in the backend folder

// Endpoint to get all apps
app.get("/api/apps", (req, res) => {
  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    const apps = JSON.parse(data);
    res.json(apps);
  });
});

// Endpoint to add a new app (POST)
app.post("/api/apps", (req, res) => {
  const newApp = req.body;

  // Basic validation
  if (!newApp.name || !newApp.url || !newApp.description) {
    return res
      .status(400)
      .json({ message: "All fields (name, url, description) are required." });
  }

  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file." });
    }

    const apps = JSON.parse(data);

    // Check for duplicate app name
    const appExists = apps.some((app) => app.name === newApp.name);
    if (appExists) {
      return res
        .status(400)
        .json({ message: "App with this name already exists." });
    }

    // Add the new app to the list
    apps.push(newApp);

    // Write the updated app list back to the file
    fs.writeFile(appsFilePath, JSON.stringify(apps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file." });
      }

      res.status(201).json({ message: "App added successfully." });
    });
  });
});

// Endpoint to update an app (PUT)
app.put("/api/apps/:name", (req, res) => {
  const appName = req.params.name;
  const updatedApp = req.body;

  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    const apps = JSON.parse(data);
    const updatedApps = apps.map((app) => {
      if (app.name === appName) {
        return { ...app, ...updatedApp };
      }
      return app;
    });

    fs.writeFile(appsFilePath, JSON.stringify(updatedApps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file" });
      }
      res.json({ message: "App updated successfully" });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
