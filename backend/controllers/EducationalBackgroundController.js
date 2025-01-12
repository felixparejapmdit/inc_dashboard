const EducationalBackground = require("../models/EducationalBackground");

module.exports = {
  // Get all educational backgrounds
  getAllEducationalBackgrounds: async (req, res) => {
    try {
      const { personnel_id } = req.query;
      const whereClause = personnel_id ? { personnel_id } : {};
  
      const data = await EducationalBackground.findAll({ where: whereClause });
  
      // Parse certificate_files if stored as JSON
      const parsedData = data.map((item) => ({
        ...item.dataValues,
        certificate_files: item.certificate_files
          ? JSON.parse(item.certificate_files)
          : [],
      }));
  
      res.status(200).json(parsedData);
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
    const {
      personnel_id,
      level,
      startfrom,
      completion_year,
      school,
      field_of_study,
      degree,
      institution,
      professional_licensure_examination,
      certificate_files,
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
        certificate_files: certificate_files ? JSON.stringify(certificate_files) : null, // Save as JSON
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
      certificate_files,
    } = req.body;

    try {
      const existingRecord = await EducationalBackground.findByPk(id);

      if (!existingRecord) {
        return res.status(404).json({ message: "Record not found." });
      }

      // Check if data is unchanged
      const isUnchanged =
        existingRecord.level === level &&
        existingRecord.startfrom === startfrom &&
        existingRecord.completion_year === completion_year &&
        existingRecord.school === school &&
        existingRecord.field_of_study === field_of_study &&
        existingRecord.degree === degree &&
        existingRecord.institution === institution &&
        existingRecord.professional_licensure_examination ===
          professional_licensure_examination;

      if (isUnchanged) {
        return res.status(200).json({
          message: "No changes were made.",
          data: existingRecord,
        });
      }

      // Update the record
      await existingRecord.update({
        level,
        startfrom,
        completion_year,
        school,
        field_of_study,
        degree,
        institution,
        professional_licensure_examination,
        certificate_files: certificate_files ? JSON.stringify(certificate_files) : existingRecord.certificate_files, // Update JSON
        updated_at: new Date(),
      });

      res.status(200).json({
        message: "Educational background updated successfully.",
        data: existingRecord,
      });
    } catch (error) {
      console.error("Error updating educational background:", error.message);
      res.status(500).json({
        message: "Error updating educational background.",
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
        return res.status(404).json({ message: "Record not found." });
      }

      await record.destroy();
      res
        .status(200)
        .json({ message: "Educational background deleted successfully." });
    } catch (error) {
      console.error("Error deleting educational background:", error.message);
      res.status(500).json({
        message: "Error deleting educational background.",
        error: error.message,
      });
    }
  },

   // Upload certificates
   uploadCertificates: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded." });
      }
  
      // Save only the filenames
      const filenames = req.files.map((file) => file.filename);
  
      res.status(200).json({
        message: "Certificates uploaded successfully",
        filenames,
      });
    } catch (error) {
      console.error("Error uploading certificates:", error.message);
      res.status(500).json({
        message: "Failed to upload certificates",
        error: error.message,
      });
    }
  },

  // Update educational background with certificates
  updateEducationalBackgroundWithCertificates: async (req, res) => {
    const { id } = req.params;
    const { certificates } = req.body;
  
    try {
      const existingRecord = await EducationalBackground.findByPk(id);
  
      if (!existingRecord) {
        return res.status(404).json({ message: "Educational background not found" });
      }
  
      // Save only the filenames to the database
      await existingRecord.update({
        certificate_files: certificates ? JSON.stringify(certificates) : existingRecord.certificate_files,
      });
  
      res.status(200).json({
        message: "Educational background updated with certificates successfully",
        data: existingRecord,
      });
    } catch (error) {
      console.error("Error updating educational background with certificates:", error.message);
      res.status(500).json({
        message: "Failed to update educational background with certificates",
        error: error.message,
      });
    }
  },

// Remove a certificate file from the database and file system
removeCertificate: async (req, res) => {
  const { filePath, educationId } = req.body;

  console.log("Received filePath:", filePath);
  console.log("Received educationId:", educationId);

  if (!filePath || !educationId) {
    console.error("Missing filePath or educationId");
    return res.status(400).json({ message: "File path and education ID are required." });
  }

  try {
    const filename = path.basename(filePath);
    const absolutePath = path.resolve(__dirname, "../../uploads/certificates", filename);

    console.log("Constructed absolutePath:", absolutePath);

    // Check if the file exists and delete it
    try {
      await fs.access(absolutePath);
      await fs.unlink(absolutePath);
      console.log("File deleted:", absolutePath);
    } catch (fileError) {
      console.warn("File not found or could not be deleted:", fileError.message);
    }

    // Fetch the record from the database
    const educationalBackground = await EducationalBackground.findByPk(educationId);
    if (!educationalBackground) {
      console.error("Educational background not found for ID:", educationId);
      return res.status(404).json({ message: "Educational background not found." });
    }

    // Parse and update the certificate_files
    let certificateFiles;
    try {
      certificateFiles = JSON.parse(educationalBackground.certificate_files || "[]");
    } catch (parseError) {
      console.error("Error parsing certificate_files:", parseError);
      return res.status(500).json({
        message: "Invalid certificate files format.",
        error: parseError.message,
      });
    }

    certificateFiles = certificateFiles.filter((file) => file !== filename);
    console.log("Updated certificate_files:", certificateFiles);

    educationalBackground.certificate_files = JSON.stringify(certificateFiles);
    await educationalBackground.save();

    console.log("Database updated successfully");

    res.status(200).json({
      message: "Certificate removed successfully.",
      certificate_files: certificateFiles,
    });
  } catch (error) {
    console.error("Unexpected error in removeCertificate:", error);
    res.status(500).json({
      message: "An error occurred while removing the certificate.",
      details: error.message,
    });
  }
},

};
