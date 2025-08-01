const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all reminders
router.get("/api/reminders", verifyToken, reminderController.getAllReminders);

// Get a single reminder by ID
router.get(
  "/api/reminders/:id",
  verifyToken,
  reminderController.getReminderById
);

// Create a new reminder
router.post(
  "/api/reminders",
  verifyToken,
  verifyToken,
  reminderController.createReminder
);

// Update a reminder
router.put("/api/reminders/:id", reminderController.updateReminder);

// Delete a reminder
router.delete(
  "/api/reminders/:id",
  verifyToken,
  reminderController.deleteReminder
);

module.exports = router;
