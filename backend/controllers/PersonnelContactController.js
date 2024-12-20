const PersonnelContact = require("../models/PersonnelContact");

exports.getAllContacts = async (req, res) => {
  try {
    const { personnel_id } = req.query;
    const whereClause = personnel_id ? { personnel_id } : {};
    const contacts = await PersonnelContact.findAll({ where: whereClause });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error.message);
    res.status(500).json({ error: "Failed to fetch contacts." });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await PersonnelContact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found." });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching contact by ID:", error.message);
    res.status(500).json({ error: "Failed to fetch contact." });
  }
};

exports.createContact = async (req, res) => {
  const { personnel_id, contactype_id, contact_info } = req.body;

  if (!personnel_id || !contactype_id || !contact_info) {
    return res.status(400).json({
      error: "Personnel ID, Contact Type, and Contact Info are required.",
    });
  }

  try {
    const newContact = await PersonnelContact.create({
      personnel_id,
      contactype_id,
      contact_info,
    });

    res.status(201).json({
      message: "Contact created successfully.",
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error.message);
    res.status(500).json({ error: "Failed to create contact." });
  }
};

exports.updateContact = async (req, res) => {
  const { personnel_id, contactype_id, contact_info } = req.body;

  console.log("Received ID for update:", req.params.id);
  console.log("Received Payload:", {
    personnel_id,
    contactype_id,
    contact_info,
  });

  if (!personnel_id || !contactype_id || !contact_info) {
    return res.status(400).json({
      error: "Personnel ID, Contact Type, and Contact Info are required.",
    });
  }

  try {
    const existingRecord = await PersonnelContact.findByPk(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({ error: "Contact not found." });
    }

    const isUnchanged =
      existingRecord.personnel_id === personnel_id &&
      existingRecord.contactype_id === contactype_id &&
      existingRecord.contact_info === contact_info;

    if (isUnchanged) {
      console.log("No changes detected in the data.");
      return res.status(200).json({
        message: "No changes were made.",
        data: existingRecord,
      });
    }

    await existingRecord.update({
      personnel_id,
      contactype_id,
      contact_info,
    });

    console.log("Updated Record:", existingRecord);

    res.status(200).json({
      message: "Contact updated successfully.",
      data: existingRecord,
    });
  } catch (error) {
    console.error("Error updating contact:", error.message);
    res.status(500).json({ error: "Failed to update contact." });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const existingRecord = await PersonnelContact.findByPk(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({ message: "Contact not found." });
    }

    await existingRecord.destroy();

    res.status(200).json({ message: "Contact deleted successfully." });
  } catch (error) {
    console.error("Error deleting contact:", error.message);
    res.status(500).json({ error: "Failed to delete contact." });
  }
};
