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
    const { id } = req.params;
    const { personnel_id } = req.query; // Assuming personnel_id is provided as a query parameter

    if (!personnel_id) {
      return res.status(400).json({ message: "Personnel ID is required." });
    }

    // Fetch the Government ID record with the provided ID and personnel_id
    const govID = await PersonnelGovID.findOne({
      where: {
        id,
        personnel_id, // Ensuring the record belongs to the specific personnel
      },
    });

    if (!govID) {
      return res.status(404).json({ message: "Government ID not found." });
    }

    res.status(200).json(govID);
  } catch (error) {
    console.error("Error fetching Government ID:", error.message);
    res.status(500).json({
      message: "Failed to fetch Government ID.",
      error: error.message,
    });
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
  const { personnel_id, gov_id, gov_issued_id } = req.body;

  console.log("Received ID for update:", req.params.id); // Log the ID
  console.log("Received Payload:", { personnel_id, gov_id, gov_issued_id }); // Log the payload

  if (!personnel_id || !gov_id || !gov_issued_id) {
    return res.status(400).json({
      error:
        "Personnel ID, Government ID type, and Government Issued ID are required.",
    });
  }

  try {
    // Check if the record exists
    const existingRecord = await PersonnelGovID.findByPk(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({ error: "Government ID not found." });
    }

    // Compare existing data with the new payload
    const isUnchanged =
      existingRecord.personnel_id === personnel_id &&
      existingRecord.gov_id === gov_id &&
      existingRecord.gov_issued_id === gov_issued_id;

    if (isUnchanged) {
      console.log("No changes detected in the data.");
      return res.status(200).json({
        message: "No changes were made.",
        data: existingRecord,
      });
    }

    // Perform the update
    await PersonnelGovID.update(
      { personnel_id, gov_id, gov_issued_id },
      { where: { id: req.params.id } }
    );

    // Return the updated record
    const updatedRecord = await PersonnelGovID.findByPk(req.params.id);
    console.log("Updated Record:", updatedRecord);

    return res.status(200).json({
      message: "Government ID updated successfully.",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating government ID:", error.message);
    return res.status(500).json({
      error: "Failed to update government ID. Please try again later.",
    });
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
