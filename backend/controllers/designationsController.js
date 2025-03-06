const Designation = require("../models/Designation");

// Get all designations
exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.findAll({
      order: [["id", "ASC"]], // Order by 'name' in ascending order
    });
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving designations", error });
  }
};

// Get a single designation by ID
exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findByPk(req.params.id);
    if (!designation)
      return res.status(404).json({ message: "Designation not found" });
    res.status(200).json(designation);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving designation", error });
  }
};

// Create a new designation
exports.createDesignation = async (req, res) => {
  try {
    const newDesignation = await Designation.create(req.body);
    res.status(201).json({
      message: "Designation created successfully",
      designation: newDesignation,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating designation", error });
  }
};

// Update a designation by ID
exports.updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByPk(req.params.id);
    if (!designation)
      return res.status(404).json({ message: "Designation not found" });

    await designation.update(req.body);
    res
      .status(200)
      .json({ message: "Designation updated successfully", designation });
  } catch (error) {
    res.status(500).json({ message: "Error updating designation", error });
  }
};

// Delete a designation by ID
exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByPk(req.params.id);
    if (!designation)
      return res.status(404).json({ message: "Designation not found" });

    await designation.destroy();
    res.status(200).json({ message: "Designation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting designation", error });
  }
};
