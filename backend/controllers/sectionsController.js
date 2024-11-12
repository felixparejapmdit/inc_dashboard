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
    const { department_id, name, image_url } = req.body;

    // Validate required fields
    if (!department_id || !name) {
      return res
        .status(400)
        .json({ message: "Department ID and Name are required." });
    }

    const newSection = await Section.create({
      department_id,
      name,
      image_url,
    });

    res.status(201).json({
      message: "Section created successfully",
      section: newSection,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating section", error });
  }
};

// Update a section by ID
exports.updateSection = async (req, res) => {
  try {
    const { department_id, name, image_url } = req.body;
    const section = await Section.findByPk(req.params.id);

    if (!section) return res.status(404).json({ message: "Section not found" });

    // Update only if provided in the request body
    if (department_id) section.department_id = department_id;
    if (name) section.name = name;
    if (image_url !== undefined) section.image_url = image_url;

    await section.save();
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
