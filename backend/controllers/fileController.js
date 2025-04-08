const File = require("../models/File");

// Get all files
exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.findAll({
      order: [["created_at", "DESC"]], // Order by 'created_at' in descending order
    });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving files", error });
  }
};

// Get a single file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving file", error });
  }
};

// Create a new file
exports.createFile = async (req, res) => {
  try {
    const newFile = await File.create(req.body);
    res.status(201).json({
      message: "File created successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Error creating file:", error); // <-- Console log for debugging
    res.status(500).json({ message: "Error creating file", error });
  }
};

// Update a file by ID
exports.updateFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    await file.update(req.body);
    res.status(200).json({ message: "File updated successfully", file });
  } catch (error) {
    res.status(500).json({ message: "Error updating file", error });
  }
};

// Delete a file by ID
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    await file.destroy();
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting file", error });
  }
};
