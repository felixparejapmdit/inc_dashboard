const PersonnelAddress = require("../models/PersonnelAddress");

const getAddressesByPersonnel = async (req, res) => {
  try {
    const addresses = await PersonnelAddress.findAll({
      where: { personnel_id: req.params.personnel_id },
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addresses." });
  }
};

const addAddress = async (req, res) => {
  try {
    const address = await PersonnelAddress.create(req.body);
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: "Failed to add address." });
  }
};

module.exports = { getAddressesByPersonnel, addAddress };
