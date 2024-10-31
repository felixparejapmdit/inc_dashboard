const express = require("express");
const router = express.Router();
const db = require("../db");

// Add new personnel
router.post("/api/personnels", (req, res) => {
  const personnelData = req.body;

  const query = "INSERT INTO personnels SET ?";
  db.query(query, personnelData, (err, results) => {
    if (err) {
      console.error("Error adding personnel:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Personnel added successfully." });
  });
});

// Fetch all personnel data
router.get("/api/personnels", (req, res) => {
  db.query("SELECT * FROM personnels", (err, results) => {
    if (err) {
      console.error("Error fetching personnel data:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
