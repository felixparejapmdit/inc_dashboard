const express = require("express");
const fs = require("fs");
const app = express();

const path = require("path"); // Added to resolve file paths

const remindersFilePath = path.join(__dirname, "reminders.json");

// --- Reminder Endpoints ---
// Get all reminders
app.get("/api/reminders", (req, res) => {
  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });
    const reminders = JSON.parse(data);
    res.json(reminders);
  });
});

// Add a new reminder (POST)
app.post("/api/reminders", (req, res) => {
  const newReminder = { ...req.body, id: new Date().getTime() }; // Add unique ID to new reminder

  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const reminders = JSON.parse(data);
    reminders.push(newReminder);

    fs.writeFile(
      remindersFilePath,
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(201).json({ message: "Reminder added successfully" });
      }
    );
  });
});

// Update a reminder (PUT)
app.put("/api/reminders/:id", (req, res) => {
  const reminderId = parseInt(req.params.id, 10);
  const updatedReminder = req.body;

  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let reminders = JSON.parse(data);
    const reminderIndex = reminders.findIndex(
      (reminder) => reminder.id === reminderId
    );

    if (reminderIndex === -1) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      ...updatedReminder,
    };

    fs.writeFile(
      remindersFilePath,
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(200).json({ message: "Reminder updated successfully" });
      }
    );
  });
});

// Delete a reminder (DELETE)
app.delete("/api/reminders/:id", (req, res) => {
  const reminderId = parseInt(req.params.id, 10);

  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let reminders = JSON.parse(data);
    reminders = reminders.filter((reminder) => reminder.id !== reminderId);

    fs.writeFile(
      remindersFilePath,
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(200).json({ message: "Reminder deleted successfully" });
      }
    );
  });
});
