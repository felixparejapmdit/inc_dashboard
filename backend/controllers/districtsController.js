const District = require("../models/District");

// Get all districts ordered by name (ascending)
exports.getAllDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      order: [["name", "ASC"]], // Order by 'name' column in ascending order
    });
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving districts", error });
  }
};

// Get a single district by ID
exports.getDistrictById = async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district)
      return res.status(404).json({ message: "District not found" });
    res.status(200).json(district);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving district", error });
  }
};

// Create a new district
exports.createDistrict = async (req, res) => {
  try {
    const newDistrict = await District.create(req.body);
    res.status(201).json({
      message: "District created successfully",
      district: newDistrict,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating district", error });
  }
};

// Update a district by ID
exports.updateDistrict = async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district)
      return res.status(404).json({ message: "District not found" });

    await district.update(req.body);
    res
      .status(200)
      .json({ message: "District updated successfully", district });
  } catch (error) {
    res.status(500).json({ message: "Error updating district", error });
  }
};

// Delete a district by ID
exports.deleteDistrict = async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district)
      return res.status(404).json({ message: "District not found" });

    await district.destroy();
    res.status(200).json({ message: "District deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting district", error });
  }
};
