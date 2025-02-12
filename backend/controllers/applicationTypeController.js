const ApplicationType = require("../models/ApplicationType");

// Get all application types sorted by id in ascending order
exports.getApplicationTypes = async (req, res) => {
  try {
    const applicationTypes = await ApplicationType.findAll({
      order: [["id", "ASC"]], // Sort by `id` in ascending order
    });
    res.json(applicationTypes);
  } catch (error) {
    console.error("Error fetching application types:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Create new application type
exports.createApplicationType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    console.log("🔍 Creating Application Type:", name); // Debugging log
    console.log("🛠 Model Check:", ApplicationType); // Ensure model is defined

    // Insert new application type into the database
    const newApplicationType = await ApplicationType.create({ name });

    console.log("✅ Successfully Created:", newApplicationType);

    res.status(201).json({
      message: "Application Type added successfully",
      data: newApplicationType,
    });
  } catch (error) {
    console.error("❌ Database Error:", error); // Log full error details
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Update application type
exports.updateApplicationType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const applicationType = await ApplicationType.findByPk(id);
    if (!applicationType) {
      return res.status(404).json({ message: "Application type not found" });
    }

    applicationType.name = name || applicationType.name;
    await applicationType.save();
    res.json(applicationType);
  } catch (error) {
    console.error("Error updating application type:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete application type
exports.deleteApplicationType = async (req, res) => {
  const { id } = req.params;

  try {
    const applicationType = await ApplicationType.findByPk(id);
    if (!applicationType) {
      return res.status(404).json({ message: "Application type not found" });
    }

    await applicationType.destroy();
    res.json({ message: "Application type deleted successfully" });
  } catch (error) {
    console.error("Error deleting application type:", error);
    res.status(500).json({ message: "Database error" });
  }
};
