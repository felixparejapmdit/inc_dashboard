const PersonnelContact = require("../models/PersonnelContact");

const getContactsByPersonnel = async (req, res) => {
  try {
    const contacts = await PersonnelContact.findAll({
      where: { personnel_id: req.params.personnel_id },
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts." });
  }
};

const addContact = async (req, res) => {
  try {
    const contact = await PersonnelContact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to add contact." });
  }
};

module.exports = { getContactsByPersonnel, addContact };
