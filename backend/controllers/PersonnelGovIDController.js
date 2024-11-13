const PersonnelGovID = require("../models/PersonnelGovID");

const getGovIDsByPersonnel = async (req, res) => {
  try {
    const govIDs = await PersonnelGovID.findAll({
      where: { personnel_id: req.params.personnel_id },
    });
    res.json(govIDs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch IDs." });
  }
};

const addGovID = async (req, res) => {
  try {
    const govID = await PersonnelGovID.create(req.body);
    res.status(201).json(govID);
  } catch (err) {
    res.status(500).json({ error: "Failed to add ID." });
  }
};

module.exports = { getGovIDsByPersonnel, addGovID };
