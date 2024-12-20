const WorkExperience = require("../models/WorkExperience");

module.exports = {
  // Get all work experiences
  getAllWorkExperiences: async (req, res) => {
    try {
      const { personnel_id } = req.query; // Extract personnel_id from query params
      const whereClause = personnel_id ? { personnel_id } : {}; // Filter by personnel_id if provided

      const data = await WorkExperience.findAll({ where: whereClause });
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      res.status(500).json({
        message: "Error fetching work experiences",
        error: error.message,
      });
    }
  },

  addWorkExperience: async (req, res) => {
    const {
      personnel_id,
      employment_type,
      company,
      address,
      position,
      department,
      section,
      start_date,
      end_date,
      reason_for_leaving,
    } = req.body;

    if (!personnel_id || !employment_type || !company) {
      return res.status(400).json({
        message:
          "Personnel ID, employment type, and company are required fields.",
      });
    }

    try {
      const newRecord = await WorkExperience.create({
        personnel_id,
        employment_type,
        company,
        address,
        position,
        department,
        section,
        start_date,
        end_date,
        reason_for_leaving,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json(newRecord);
    } catch (error) {
      console.error("Error adding work experience:", error.message);
      res.status(500).json({
        message: "Error adding work experience.",
        error: error.message,
      });
    }
  },

  updateWorkExperience: async (req, res) => {
    const { id } = req.params;
    const {
      employment_type,
      company,
      address,
      position,
      department,
      section,
      start_date,
      end_date,
      reason_for_leaving,
    } = req.body;

    try {
      const existingRecord = await WorkExperience.findByPk(id);

      if (!existingRecord) {
        return res.status(404).json({ message: "Record not found." });
      }

      // Check if data is unchanged
      const isUnchanged =
        existingRecord.employment_type === employment_type &&
        existingRecord.company === company &&
        existingRecord.address === address &&
        existingRecord.position === position &&
        existingRecord.department === department &&
        existingRecord.section === section &&
        existingRecord.start_date === start_date &&
        existingRecord.end_date === end_date &&
        existingRecord.reason_for_leaving === reason_for_leaving;

      if (isUnchanged) {
        return res.status(200).json({
          message: "No changes were made.",
          data: existingRecord,
        });
      }

      // Update the record
      await existingRecord.update({
        employment_type,
        company,
        address,
        position,
        department,
        section,
        start_date,
        end_date,
        reason_for_leaving,
        updated_at: new Date(),
      });

      res.status(200).json({
        message: "Work experience updated successfully.",
        data: existingRecord,
      });
    } catch (error) {
      console.error("Error updating work experience:", error.message);
      res.status(500).json({
        message: "Error updating work experience.",
        error: error.message,
      });
    }
  },

  deleteWorkExperience: async (req, res) => {
    const { id } = req.params;

    try {
      const record = await WorkExperience.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found." });
      }

      await record.destroy();
      res
        .status(200)
        .json({ message: "Work experience deleted successfully." });
    } catch (error) {
      console.error("Error deleting work experience:", error.message);
      res.status(500).json({
        message: "Error deleting work experience.",
        error: error.message,
      });
    }
  },
};
