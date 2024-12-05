const WorkExperience = require("../models/WorkExperience");

module.exports = {
  getAllWorkExperiences: async (req, res) => {
    try {
      const data = await WorkExperience.findAll();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      res.status(500).json({ message: "Error fetching work experiences" });
    }
  },

  addWorkExperience: async (req, res) => {
    try {
      // Ensure that personnel_id is set
      const personnelId = req.body.personnel_id || 9; // Default to 9 if not provided
      const newRecord = await WorkExperience.create({
        ...req.body,
        personnel_id: personnelId, // Set personnel_id explicitly
      });
      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error adding work experience:", error);
      res.status(500).json({ message: "Error adding work experience" });
    }
  },

  updateWorkExperience: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await WorkExperience.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      await record.update(req.body);
      res.status(200).json(record);
    } catch (error) {
      console.error("Error updating work experience:", error);
      res.status(500).json({ message: "Error updating work experience" });
    }
  },

  deleteWorkExperience: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await WorkExperience.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      await record.destroy();
      res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
      console.error("Error deleting work experience:", error);
      res.status(500).json({ message: "Error deleting work experience" });
    }
  },
};
