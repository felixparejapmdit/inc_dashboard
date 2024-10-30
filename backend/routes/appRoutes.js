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
