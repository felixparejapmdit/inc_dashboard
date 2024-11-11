const Section = require("../models/Section");

// Get all sections
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.findAll();
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving sections", error });
  }
};

// Get a single section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving section", error });
  }
};

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const newSection = await Section.create(req.body);
    res
      .status(201)
      .json({ message: "Section created successfully", section: newSection });
  } catch (error) {
    res.status(500).json({ message: "Error creating section", error });
  }
};

// Update a section by ID
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    await section.update(req.body);
    res.status(200).json({ message: "Section updated successfully", section });
  } catch (error) {
    res.status(500).json({ message: "Error updating section", error });
  }
};

// Delete a section by ID
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    await section.destroy();
    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting section", error });
  }
};
