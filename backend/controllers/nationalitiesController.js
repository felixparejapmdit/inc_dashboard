const Nationality = require("../models/Nationality");

// Get all nationalities
exports.getAllNationalities = async (req, res) => {
  try {
    const nationalities = await Nationality.findAll({
      order: [["nationality", "ASC"]], // Order by 'nationality' in ascending order
    });
    res.status(200).json(nationalities);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving nationalities", error });
  }
};

// Get a single nationality by ID
exports.getNationalityById = async (req, res) => {
  try {
    const nationality = await Nationality.findByPk(req.params.id);
    if (!nationality)
      return res.status(404).json({ message: "Nationality not found" });
    res.status(200).json(nationality);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving nationality", error });
  }
};

// Create a new nationality
exports.createNationality = async (req, res) => {
  try {
    console.log("Received req.body:", req.body);  // <-- Add this
    const newNationality = await Nationality.create(req.body);
    res.status(201).json({
      message: "Nationality created successfully",
      nationality: newNationality,
    });
  } catch (error) {
    console.error("Error creating nationality:", error);  // <-- Add this
    res.status(500).json({ message: "Error creating nationality", error });
  }
};


// Update a nationality by ID
exports.updateNationality = async (req, res) => {
  try {
    const nationality = await Nationality.findByPk(req.params.id);
    if (!nationality)
      return res.status(404).json({ message: "Nationality not found" });

    await nationality.update(req.body);
    res
      .status(200)
      .json({ message: "Nationality updated successfully", nationality });
  } catch (error) {
    res.status(500).json({ message: "Error updating nationality", error });
  }
};

// Delete a nationality by ID
exports.deleteNationality = async (req, res) => {
  try {
    const nationality = await Nationality.findByPk(req.params.id);
    if (!nationality)
      return res.status(404).json({ message: "Nationality not found" });

    await nationality.destroy();
    res.status(200).json({ message: "Nationality deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting nationality", error });
  }
};
