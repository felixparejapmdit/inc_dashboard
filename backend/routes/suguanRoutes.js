const express = require("express");
const fs = require("fs");
const app = express();

const path = require("path"); // Added to resolve file paths

const suguanFilePath = path.join(__dirname, "suguan.json");

// --- Suguan Endpoints ---
app.get("/api/suguan", (req, res) => {
  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    const suguan = JSON.parse(data);
    res.json(suguan);
  });
});

app.post("/api/suguan", (req, res) => {
  const newSuguan = { ...req.body, id: Date.now() }; // Add a unique id based on timestamp

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file." });
    }

    const suguan = JSON.parse(data);
    suguan.push(newSuguan);

    fs.writeFile(suguanFilePath, JSON.stringify(suguan, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file." });
      }
      res.status(201).json({ message: "Suguan added successfully." });
    });
  });
});

// --- More endpoints for Events and Reminders follow the same structure ---

// Endpoint to update a suguan (PUT)
app.put("/api/suguan/:id", (req, res) => {
  const suguanId = parseInt(req.params.id, 10);
  const updatedSuguan = req.body;

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    const suguan = JSON.parse(data);
    const updatedSuguanList = suguan.map((sugu) =>
      sugu.id === suguanId ? { ...sugu, ...updatedSuguan } : sugu
    );

    fs.writeFile(
      suguanFilePath,
      JSON.stringify(updatedSuguanList, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }
        res.json({ message: "Suguan updated successfully" });
      }
    );
  });
});

// Endpoint to delete a suguan
app.delete("/api/suguan/:id", (req, res) => {
  const suguanId = parseInt(req.params.id, 10);

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    let suguan = JSON.parse(data);
    const filteredSuguan = suguan.filter((sugu) => sugu.id !== suguanId);

    fs.writeFile(
      suguanFilePath,
      JSON.stringify(filteredSuguan, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }
        res.status(200).json({ message: "Suguan deleted successfully." });
      }
    );
  });
});
