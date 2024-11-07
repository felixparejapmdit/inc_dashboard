const express = require("express");
const router = express.Router();
const db = require("../db");

// --- Get all apps ---
router.get("/api/apps", (req, res) => {
  const query = "SELECT * FROM apps";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching apps:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// Middleware to extract userId from Authorization header
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const userId = authHeader.split(" ")[1];
    req.user = { id: parseInt(userId, 10) }; // Ensure userId is an integer
  }
  next();
});

// --- Get available apps for the logged-in user ---
router.get("/api/availableapps", (req, res) => {
  // Retrieve user ID from the custom header 'x-user-id'
  const userId = req.headers["x-user-id"];

  // Check if the userId is provided in the headers
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user ID provided", userId: null });
  }

  const query = `
    SELECT apps.*
    FROM apps
    JOIN available_apps ON apps.id = available_apps.app_id
    WHERE available_apps.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching available apps for user:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results || []); // Return an empty array if no results
  });
});

// --- Add a new app ---
router.post("/api/apps", (req, res) => {
  const { name, url, description, icon } = req.body;
  if (!name || !url || !description) {
    return res.status(400).json({
      message: "All fields (name, url, description) are required.",
    });
  }

  const checkQuery = "SELECT * FROM apps WHERE name = ?";
  db.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error("Error checking app existence:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "App with this name already exists." });
    }

    const insertQuery =
      "INSERT INTO apps (name, url, description, icon) VALUES (?, ?, ?, ?)";
    db.query(
      insertQuery,
      [name, url, description, icon || null],
      (err, result) => {
        if (err) {
          console.error("Error inserting app:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({
          message: "App added successfully.",
          app: { id: result.insertId, name, url, description, icon },
        });
      }
    );
  });
});

// --- Update an existing app by id ---
router.put("/api/apps/:id", (req, res) => {
  const appId = req.params.id;
  const { name, url, description, icon } = req.body;

  if (!name || !url) {
    return res
      .status(400)
      .json({ message: "Name and URL fields are required." });
  }

  const updateQuery =
    "UPDATE apps SET name = ?, url = ?, description = ?, icon = ? WHERE id = ?";
  db.query(
    updateQuery,
    [name, url, description, icon || null, appId],
    (err, results) => {
      if (err) {
        console.error("Error updating app:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "App not found." });
      }

      // Send back the updated app data
      res.json({
        message: "App updated successfully.",
        app: { id: appId, name, url, description, icon },
      });
    }
  );
});

// --- Delete an app by id ---
router.delete("/api/apps/:id", (req, res) => {
  const appId = req.params.id;
  const deleteQuery = "DELETE FROM apps WHERE id = ?";

  db.query(deleteQuery, [appId], (err, results) => {
    if (err) {
      console.error("Error deleting app:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "App not found." });
    }
    res.status(200).json({ message: "App deleted successfully." });
  });
});

module.exports = router;
