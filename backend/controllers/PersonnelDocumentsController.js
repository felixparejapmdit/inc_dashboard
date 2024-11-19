const PersonnelDocuments = require("../models/PersonnelDocuments");

module.exports = {
  // Controller to handle document upload
  uploadDocument: async (req, res) => {
    try {
      const {
        document_id,
        personnel_id,
        description,
        status,
        expiration_date,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // Save the uploaded document details in the database
      const newDocument = await PersonnelDocuments.create({
        document_id,
        personnel_id,
        document_type_id: document_id, // Assuming this is the document type ID
        file_name: req.file.originalname,
        file_path: req.file.path,
        uploaded_by: req.user?.id || 1, // Replace with dynamic user ID logic
        upload_date: new Date(),
        description,
        expiration_date,
        status,
      });

      res.status(201).json({
        message: "Document uploaded successfully.",
        document: newDocument,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Error uploading document." });
    }
  },

  // Controller to get documents by personnel ID
  getDocumentsByPersonnelId: async (req, res) => {
    const { personnel_id } = req.params;
    try {
      const documents = await PersonnelDocuments.findAll({
        where: { personnel_id },
      });

      res.status(200).json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Error fetching documents." });
    }
  },
};
