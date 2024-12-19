const PersonnelGovID = require("../models/PersonnelGovID");

exports.getAllGovIDs = async (req, res) => {
  try {
    const { personnel_id } = req.query;
    const whereClause = personnel_id ? { personnel_id } : {};
    const govIDs = await PersonnelGovID.findAll({ where: whereClause });
    res.status(200).json(govIDs);
  } catch (error) {
    console.error("Error fetching government IDs:", error);
    res.status(500).json({ error: "Failed to fetch government IDs." });
  }
};

exports.getGovIDById = async (req, res) => {
  try {
    const govID = await PersonnelGovID.findByPk(req.params.id);
    if (!govID) {
      return res.status(404).json({ message: "Government ID not found" });
    }
    res.status(200).json(govID);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGovID = async (req, res) => {
  const { personnel_id, gov_id, gov_issued_id } = req.body;

  // Validate required fields
  if (!personnel_id || !gov_id || !gov_issued_id) {
    return res.status(400).json({
      error:
        "Personnel ID, Government ID type, and Government Issued ID are required.",
    });
  }

  try {
    // Create new government ID entry
    const newGovID = await PersonnelGovID.create({
      personnel_id,
      gov_id,
      gov_issued_id,
    });

    // Send success response
    res.status(201).json(newGovID);
  } catch (error) {
    console.error("Error creating government ID:", error);
    res.status(500).json({
      error: "Failed to create government ID. Please try again later.",
    });
  }
};

exports.updateGovID = async (req, res) => {
  try {
    const updated = await PersonnelGovID.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated[0] === 0) {
      return res.status(404).json({ message: "Government ID not found" });
    }
    res.status(200).json({ message: "Government ID updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGovID = async (req, res) => {
  try {
    const deleted = await PersonnelGovID.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Government ID not found" });
    }
    res.status(200).json({ message: "Government ID deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
