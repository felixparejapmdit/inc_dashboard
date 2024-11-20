const EducationalBackground = require("../models/EducationalBackground");

module.exports = {
  // Get all educational backgrounds
  getAllEducationalBackgrounds: async (req, res) => {
    try {
      const data = await EducationalBackground.findAll();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching educational backgrounds:", error);
      res.status(500).json({
        message: "Error fetching educational backgrounds",
        error: error.message,
      });
    }
  },

  // Add a new educational background
  addEducationalBackground: async (req, res) => {
    console.log("Request Body:", req.body); // Debugging log

    const {
      personnel_id = 8,
      level,
      startfrom,
      completion_year,
      school,
      field_of_study,
      degree,
      institution,
      professional_licensure_examination,
    } = req.body;

    if (!personnel_id || !level || !school) {
      return res.status(400).json({
        message: "Personnel ID, level, and school are required fields.",
      });
    }

    try {
      const newRecord = await EducationalBackground.create({
        personnel_id,
        level,
        startfrom,
        completion_year,
        school,
        field_of_study,
        degree,
        institution,
        professional_licensure_examination,
        created_at: new Date(),
        updated_at: new Date(),
      });
      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error adding educational background:", error);
      res.status(500).json({
        message: "Error adding educational background",
        error: error.message,
      });
    }
  },

  // Update an existing educational background
  updateEducationalBackground: async (req, res) => {
    const { id } = req.params;
    const {
      level,
      startfrom,
      completion_year,
      school,
      field_of_study,
      degree,
      institution,
      professional_licensure_examination,
    } = req.body;

    try {
      const record = await EducationalBackground.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      await record.update({
        level,
        startfrom,
        completion_year,
        school,
        field_of_study,
        degree,
        institution,
        professional_licensure_examination,
        updated_at: new Date(),
      });

      res.status(200).json({
        message: "Educational background updated successfully",
        data: record,
      });
    } catch (error) {
      console.error("Error updating educational background:", error);
      res.status(500).json({
        message: "Error updating educational background",
        error: error.message,
      });
    }
  },

  // Delete an educational background
  deleteEducationalBackground: async (req, res) => {
    const { id } = req.params;

    try {
      const record = await EducationalBackground.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      await record.destroy();
      res.status(200).json({
        message: "Educational background deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting educational background:", error);
      res.status(500).json({
        message: "Error deleting educational background",
        error: error.message,
      });
    }
  },
};
