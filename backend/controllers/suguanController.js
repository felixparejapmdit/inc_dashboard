const Suguan = require("../models/Suguan");

// Get all Suguan entries
exports.getAllSuguan = async (req, res) => {
  console.log("📥 GET /api/suguan hit");
  try {
    const suguan = await Suguan.findAll({
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ], // Order by date and time
    });
    if (!suguan) {
      return res.status(200).json([]);
    }
    res.status(200).json(suguan);
  } catch (error) {
    console.error("Error retrieving Suguan data:", error);
    res.status(500).json({ message: "Error retrieving Suguan data.", error });
  }
};

// Get a single Suguan entry by ID
exports.getSuguanById = async (req, res) => {
  try {
    const suguan = await Suguan.findByPk(req.params.id);
    if (!suguan) {
      return res
        .status(404)
        .json({ message: `Suguan with ID ${req.params.id} not found.` });
    }
    res.status(200).json(suguan);
  } catch (error) {
    console.error("Error retrieving Suguan by ID:", error);
    res.status(500).json({ message: "Error retrieving Suguan by ID.", error });
  }
};

// Create a new Suguan entry
exports.createSuguan = async (req, res) => {
  try {
    const { name, district_id, local_id, date, time, gampanin_id, section_id, subsection_id, personnel_id } = req.body;

    // Log the request body for debugging
    console.log("Request Body:", req.body);

    if (!name || !district_id || !local_id || !date || !time || !gampanin_id) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newSuguan = await Suguan.create({
      name,
      district_id,
      local_congregation: local_id, // Make sure the key matches the Sequelize model
      date,
      time,
      gampanin_id,
      section_id,
      subsection_id,
      personnel_id,
    });

    console.log("Request Payload:", {
      name,
      district_id,
      local_id,
      date,
      time,
      gampanin_id,
      section_id,
      subsection_id,
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
    const { name, district_id, local_id, date, time, gampanin_id, section_id, subsection_id, personnel_id } = req.body;
    const suguan = await Suguan.findByPk(req.params.id);

    if (!suguan) {
      return res
        .status(404)
        .json({ message: `Suguan with ID ${req.params.id} not found.` });
    }

    // Update only if provided in the request body
    if (name) suguan.name = name;
    if (district_id) suguan.district_id = district_id;
    if (local_id) suguan.local_congregation = local_id; // Adjust field mapping
    if (date) suguan.date = date;
    if (time) suguan.time = time;
    if (gampanin_id) suguan.gampanin_id = gampanin_id;
    if (section_id) suguan.section_id = section_id;
    if (subsection_id) suguan.subsection_id = subsection_id;
    if (personnel_id) suguan.personnel_id = personnel_id;

    await suguan.save();
    res.status(200).json({ message: "Suguan updated successfully.", suguan });
  } catch (error) {
    console.error("Error updating Suguan:", error);
    res.status(500).json({ message: "Error updating Suguan.", error });
  }
};

// Delete a Suguan entry by ID
exports.deleteSuguan = async (req, res) => {
  try {
    const suguan = await Suguan.findByPk(req.params.id);
    if (!suguan) {
      return res
        .status(404)
        .json({ message: `Suguan with ID ${req.params.id} not found.` });
    }

    await suguan.destroy();
    res.status(200).json({ message: "Suguan deleted successfully." });
  } catch (error) {
    console.error("Error deleting Suguan:", error);
    res.status(500).json({ message: "Error deleting Suguan.", error });
  }
};
