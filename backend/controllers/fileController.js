const FileShare = require("../models/FileShare"); // Import the FileShare model
const File = require("../models/File");
const User = require("../models/User"); // Import the User model

// Get all files
const getAllFiles = async (req, res) => {
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
const getFileById = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving file", error });
  }
};

// Get files by user ID
const getFileByUserID = async (req, res) => {
  const userId = req.params.userId;

  try {
    const files = await File.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user's files", error });
  }
};

// Create a new file
const createFile = async (req, res) => {
  try {
    const newFile = await File.create(req.body);
    res.status(201).json({
      message: "File created successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({ message: "Error creating file", error });
  }
};

// Update a file by ID
const updateFile = async (req, res) => {
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
const deleteFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    await file.destroy();
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting file", error });
  }
};

// Handle the logic to share the file
const shareFile = async (file_id, user_id) => {
  try {
    const existingShare = await FileShare.findOne({
      where: { file_id, user_id },
    });

    if (existingShare) {
      return {
        message: "File is already shared with this user.",
      };
    }

    const newShare = await FileShare.create({ file_id, user_id });

    return {
      message: "File shared successfully.",
      data: newShare,
    };
  } catch (error) {
    console.error("Error sharing file:", error);
    return {
      message: "Error sharing file.",
      error,
    };
  }
};

module.exports = {
  getAllFiles,
  getFileById,
  getFileByUserID,
  createFile,
  updateFile,
  deleteFile,
  shareFile,
};
