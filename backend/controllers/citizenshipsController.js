const Citizenship = require("../models/Citizenship");

// Get all citizenships
exports.getAllCitizenships = async (req, res) => {
  try {
    const citizenships = await Citizenship.findAll();
    res.status(200).json(citizenships);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving citizenships", error });
  }
};

// Get a single citizenship by ID
exports.getCitizenshipById = async (req, res) => {
  try {
    const citizenship = await Citizenship.findByPk(req.params.id);
    if (!citizenship)
      return res.status(404).json({ message: "Citizenship not found" });
    res.status(200).json(citizenship);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving citizenship", error });
  }
};

// Create a new citizenship
exports.createCitizenship = async (req, res) => {
  try {
    const newCitizenship = await Citizenship.create(req.body);
    res.status(201).json({
      message: "Citizenship created successfully",
      citizenship: newCitizenship,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating citizenship", error });
  }
};

// Update a citizenship by ID
exports.updateCitizenship = async (req, res) => {
  try {
    const citizenship = await Citizenship.findByPk(req.params.id);
    if (!citizenship)
      return res.status(404).json({ message: "Citizenship not found" });

    await citizenship.update(req.body);
    res
      .status(200)
      .json({ message: "Citizenship updated successfully", citizenship });
  } catch (error) {
    res.status(500).json({ message: "Error updating citizenship", error });
  }
};

// Delete a citizenship by ID
exports.deleteCitizenship = async (req, res) => {
  try {
    const citizenship = await Citizenship.findByPk(req.params.id);
    if (!citizenship)
      return res.status(404).json({ message: "Citizenship not found" });

    await citizenship.destroy();
    res.status(200).json({ message: "Citizenship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting citizenship", error });
  }
};
