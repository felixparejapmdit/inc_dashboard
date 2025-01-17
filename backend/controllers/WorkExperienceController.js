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
    try {
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

      // Validation: Ensure required fields are present
      const requiredFields = ["personnel_id", "employment_type", "company"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Check if a record with the same personnel_id and company already exists
      const existingWorkExperience = await WorkExperience.findOne({
        where: {
          personnel_id,
          company,
        },
      });

      if (existingWorkExperience) {
        return res.status(400).json({
          message:
            "A work experience record for this personnel and company already exists.",
        });
      }

      // Create new work experience record in the database
      const newWorkExperience = await WorkExperience.create({
        personnel_id,
        employment_type,
        company,
        address: address || null,
        position: position || null,
        department: department || null,
        section: section || null,
        start_date: start_date || null,
        end_date: end_date || null,
        reason_for_leaving: reason_for_leaving || null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json({
        message: "Work experience added successfully",
        workExperience: newWorkExperience,
      });
    } catch (error) {
      console.error("Error adding work experience:", error.message);
      res.status(500).json({
        message: "Error adding work experience",
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
