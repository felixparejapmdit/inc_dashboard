const Suguan = require("../models/Suguan");

// Get all Suguan entries
exports.getAllSuguan = async (req, res) => {
  try {
    const suguan = await Suguan.findAll();
    if (!suguan || suguan.length === 0) {
      return res.status(404).json({ message: "No Suguan entries found" });
    }
    res.status(200).json(suguan);
  } catch (error) {
    console.error("Error retrieving Suguan data:", error);
    res.status(500).json({ message: "Error retrieving Suguan data", error });
  }
};

// Get a single Suguan entry by ID
exports.getSuguanById = async (req, res) => {
  try {
    const suguan = await Suguan.findByPk(req.params.id);
    if (!suguan) {
      return res
        .status(404)
        .json({ message: `Suguan with ID ${req.params.id} not found` });
    }
    res.status(200).json(suguan);
  } catch (error) {
    console.error("Error retrieving Suguan by ID:", error);
    res.status(500).json({ message: "Error retrieving Suguan by ID", error });
  }
};

// Create a new Suguan entry
exports.createSuguan = async (req, res) => {
  try {
    const { name, district_id, local_id, date, time, gampanin_id } = req.body;

    // Validate required fields
    if (!name || !district_id || !local_id || !date || !time || !gampanin_id) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newSuguan = await Suguan.create({
      name,
      district_id,
      local_id,
      date,
      time,
      gampanin_id,
    });

    res.status(201).json({
      message: "Suguan created successfully",
      suguan: newSuguan,
    });
  } catch (error) {
    console.error("Error creating Suguan:", error);
    res.status(500).json({ message: "Error creating Suguan", error });
  }
};

// Update a Suguan entry by ID
exports.updateSuguan = async (req, res) => {
  try {
    const { name, district_id, local_id, date, time, gampanin_id } = req.body;
    const suguan = await Suguan.findByPk(req.params.id);

    if (!suguan) {
      return res
        .status(404)
        .json({ message: `Suguan with ID ${req.params.id} not found` });
    }

    // Update only if provided in the request body
    if (name) suguan.name = name;
    if (district_id) suguan.district_id = district_id;
    if (local_id) suguan.local_id = local_id;
    if (date) suguan.date = date;
    if (time) suguan.time = time;
    if (gampanin_id) suguan.gampanin_id = gampanin_id;

    await suguan.save();
    res.status(200).json({ message: "Suguan updated successfully", suguan });
  } catch (error) {
    console.error("Error updating Suguan:", error);
    res.status(500).json({ message: "Error updating Suguan", error });
  }
};

// Delete a Suguan entry by ID
exports.deleteSuguan = async (req, res) => {
  try {
    const suguan = await Suguan.findByPk(req.params.id);
    if (!suguan) {
      return res
        .status(404)
        .json({ message: `Suguan with ID ${req.params.id} not found` });
    }

    await suguan.destroy();
    res.status(200).json({ message: "Suguan deleted successfully" });
  } catch (error) {
    console.error("Error deleting Suguan:", error);
    res.status(500).json({ message: "Error deleting Suguan", error });
  }
};
