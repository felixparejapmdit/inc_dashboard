const PersonnelGovID = require("../models/PersonnelGovID");

exports.getAllGovIDs = async (req, res) => {
  try {
    const govIDs = await PersonnelGovID.findAll();
    res.status(200).json(govIDs);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  try {
    const newGovID = await PersonnelGovID.create(req.body);
    res.status(201).json(newGovID);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
