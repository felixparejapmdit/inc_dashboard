const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");

// Get all reminders
router.get("/api/reminders", reminderController.getAllReminders);

// Get a single reminder by ID
router.get("/api/reminders/:id", reminderController.getReminderById);

// Create a new reminder
router.post("/api/reminders", reminderController.createReminder);

// Update a reminder
router.put("/api/reminders/:id", reminderController.updateReminder);

// Delete a reminder
router.delete("/api/reminders/:id", reminderController.deleteReminder);

module.exports = router;
