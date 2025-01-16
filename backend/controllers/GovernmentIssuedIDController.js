const GovernmentIssuedID = require("../models/GovernmentIssuedID");

module.exports = {
  // Get all government-issued IDs
  getAllGovernmentIssuedIDs: async (req, res) => {
    try {
      const governmentIDs = await GovernmentIssuedID.findAll({
        order: [["name", "ASC"]], // Order by 'name' in ascending order
      });
      res.status(200).json(governmentIDs);
    } catch (error) {
      console.error("Error fetching government-issued IDs:", error);
      res.status(500).json({ message: "Error fetching government-issued IDs" });
    }
  },

  // Add a new government-issued ID
  addGovernmentID: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    try {
      const newGovernmentID = await GovernmentIssuedID.create({ name });
      res.status(201).json(newGovernmentID);
    } catch (error) {
      console.error("Error adding government-issued ID:", error);
      res.status(500).json({ message: "Error adding government-issued ID" });
    }
  },

  // Update an existing government-issued ID
  updateGovernmentID: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    try {
      const governmentID = await GovernmentIssuedID.findByPk(id);
      if (!governmentID) {
        return res
          .status(404)
          .json({ message: "Government-issued ID not found" });
      }
      governmentID.name = name;
      await governmentID.save();
      res.status(200).json(governmentID);
    } catch (error) {
      console.error("Error updating government-issued ID:", error);
      res.status(500).json({ message: "Error updating government-issued ID" });
    }
  },

  // Delete a government-issued ID
  deleteGovernmentID: async (req, res) => {
    const { id } = req.params;
    try {
      const governmentID = await GovernmentIssuedID.findByPk(id);
      if (!governmentID) {
        return res
          .status(404)
          .json({ message: "Government-issued ID not found" });
      }
      await governmentID.destroy();
      res
        .status(200)
        .json({ message: "Government-issued ID deleted successfully" });
    } catch (error) {
      console.error("Error deleting government-issued ID:", error);
      res.status(500).json({ message: "Error deleting government-issued ID" });
    }
  },
};
