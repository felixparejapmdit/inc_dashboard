const PersonnelContact = require("../models/PersonnelContact");

exports.getAllContacts = async (req, res) => {
  try {
    const { personnel_id } = req.query; // Get personnel_id from query
    const whereClause = personnel_id ? { personnel_id } : {}; // Filter by personnel_id if provided

    const contacts = await PersonnelContact.findAll({ where: whereClause }); // Apply the where clause
    if (contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await PersonnelContact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const newContact = await PersonnelContact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const updated = await PersonnelContact.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated[0] === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const deleted = await PersonnelContact.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
