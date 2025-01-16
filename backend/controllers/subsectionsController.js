const Subsection = require("../models/Subsection");

// Get all subsections
exports.getAllSubsections = async (req, res) => {
  try {
    const subsections = await Subsection.findAll({
      order: [["name", "ASC"]], // Order by 'name' in ascending order
    });
    res.status(200).json(subsections);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving subsections", error });
  }
};

// Get a single subsection by ID
exports.getSubsectionById = async (req, res) => {
  try {
    const subsection = await Subsection.findByPk(req.params.id);
    if (!subsection)
      return res.status(404).json({ message: "Subsection not found" });
    res.status(200).json(subsection);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving subsection", error });
  }
};

// Create a new subsection
exports.createSubsection = async (req, res) => {
  try {
    const newSubsection = await Subsection.create(req.body);
    res.status(201).json({
      message: "Subsection created successfully",
      subsection: newSubsection,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating subsection", error });
  }
};

// Update a subsection by ID
exports.updateSubsection = async (req, res) => {
  try {
    const subsection = await Subsection.findByPk(req.params.id);
    if (!subsection)
      return res.status(404).json({ message: "Subsection not found" });

    await subsection.update(req.body);
    res
      .status(200)
      .json({ message: "Subsection updated successfully", subsection });
  } catch (error) {
    res.status(500).json({ message: "Error updating subsection", error });
  }
};

// Delete a subsection by ID
exports.deleteSubsection = async (req, res) => {
  try {
    const subsection = await Subsection.findByPk(req.params.id);
    if (!subsection)
      return res.status(404).json({ message: "Subsection not found" });

    await subsection.destroy();
    res.status(200).json({ message: "Subsection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subsection", error });
  }
};
