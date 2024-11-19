const ContactTypeInfo = require("../models/ContactTypeInfo");

module.exports = {
  // Get all contact types
  getAllContactTypes: async (req, res) => {
    try {
      const contactTypes = await ContactTypeInfo.findAll();
      res.status(200).json(contactTypes);
    } catch (error) {
      console.error("Error fetching contact types:", error);
      res.status(500).json({ message: "Error fetching contact types" });
    }
  },

  // Add a new contact type
  addContactType: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    try {
      const newContactType = await ContactTypeInfo.create({ name });
      res.status(201).json(newContactType);
    } catch (error) {
      console.error("Error adding contact type:", error);
      res.status(500).json({ message: "Error adding contact type" });
    }
  },

  // Update an existing contact type
  updateContactType: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    try {
      const contactType = await ContactTypeInfo.findByPk(id);
      if (!contactType) {
        return res.status(404).json({ message: "Contact type not found" });
      }
      contactType.name = name;
      await contactType.save();
      res.status(200).json(contactType);
    } catch (error) {
      console.error("Error updating contact type:", error);
      res.status(500).json({ message: "Error updating contact type" });
    }
  },

  // Delete a contact type
  deleteContactType: async (req, res) => {
    const { id } = req.params;
    try {
      const contactType = await ContactTypeInfo.findByPk(id);
      if (!contactType) {
        return res.status(404).json({ message: "Contact type not found" });
      }
      await contactType.destroy();
      res.status(200).json({ message: "Contact type deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact type:", error);
      res.status(500).json({ message: "Error deleting contact type" });
    }
  },
};
