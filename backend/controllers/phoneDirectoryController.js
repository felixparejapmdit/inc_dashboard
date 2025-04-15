const PhoneDirectory = require("../models/PhoneDirectory");

// Get all phone entries
exports.getPhoneDirectories = async (req, res) => {
  try {
    const entries = await PhoneDirectory.findAll({ order: [["id", "ASC"]] });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching phone entries:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Create new entry
exports.createPhoneDirectory = async (req, res) => {
  const {
    personnel_id,
    location,
    extension,
    phone_number,
    phone_name,
    is_active,
  } = req.body;

  if (!personnel_id || !location) {
    return res
      .status(400)
      .json({ message: "Personnel and location are required" });
  }

  try {
    const newEntry = await PhoneDirectory.create({
      personnel_id,
      location,
      extension,
      phone_number,
      phone_name,
      is_active,
    });

    res.status(201).json({
      message: "Phone directory entry added successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("❌ Error creating entry:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Update entry
exports.updatePhoneDirectory = async (req, res) => {
  const { id } = req.params;
  const {
    personnel_id,
    location,
    extension,
    phone_number,
    phone_name,
    is_active,
  } = req.body;

  try {
    const entry = await PhoneDirectory.findByPk(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    Object.assign(entry, {
      personnel_id: personnel_id ?? entry.personnel_id,
      location: location ?? entry.location,
      extension,
      phone_number,
      phone_name,
      is_active,
    });

    await entry.save();
    res.json({ message: "Entry updated", data: entry });
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete entry
exports.deletePhoneDirectory = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await PhoneDirectory.findByPk(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    await entry.destroy();
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ message: "Database error" });
  }
};
