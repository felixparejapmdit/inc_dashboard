const Reminder = require("../models/Reminder");

// Get all reminders
exports.getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      order: [["reminder_date", "ASC"]],
    });
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Error fetching reminders" });
  }
};

// Get a single reminder by ID
exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).json({ message: "Error fetching reminder" });
  }
};

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { title, description, reminder_date, time, message, created_by } = req.body;
    const newReminder = await Reminder.create({
      title,
      description,
      reminder_date,
      time,
      message,
      created_by,
    });
    res
      .status(201)
      .json({ message: "Reminder created successfully", newReminder });
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ message: "Error creating reminder" });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, reminder_date, time, message, created_by } = req.body;

    const reminder = await Reminder.findByPk(id);
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    await reminder.update({ title, description, reminder_date, time, message, created_by });
    res
      .status(200)
      .json({ message: "Reminder updated successfully", reminder });
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ message: "Error updating reminder" });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByPk(id);
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    await reminder.destroy();
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: "Error deleting reminder" });
  }
};
