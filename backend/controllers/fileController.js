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

// // Get files by user ID
// const getFileByUserID = async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     const files = await File.findAll({
//       where: { user_id: userId },
//       order: [["created_at", "DESC"]],
//     });

//     res.status(200).json(files);
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving user's files", error });
//   }
// };

// Get files by user ID (uploaded or shared)
const getFileByUserID = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Files uploaded by the user
    const uploadedFiles = await File.findAll({
      where: { user_id: userId },
    });

    // Files shared with the user
    const sharedFileIds = await FileShare.findAll({
      where: { user_id: userId },
      attributes: ["file_id"],
    });

    const sharedFileIdList = sharedFileIds.map((item) => item.file_id);

    const sharedFiles = await File.findAll({
      where: { id: sharedFileIdList },
    });

    // Combine uploaded and shared files
    const allFiles = [...uploadedFiles, ...sharedFiles].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.status(200).json(allFiles);
  } catch (error) {
    console.error("Error retrieving files:", error);
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

// Get users the file is already shared with
const getSharedUsers = async (req, res) => {
  try {
    const fileId = req.params.id;

    const shares = await FileShare.findAll({
      where: { file_id: fileId },
      attributes: ["user_id"],
    });

    const sharedUserIds = shares.map((share) => share.user_id);

    res.status(200).json({ sharedUserIds });
  } catch (error) {
    console.error("Error fetching shared users:", error);
    res.status(500).json({ message: "Failed to fetch shared users", error });
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
  getSharedUsers,
};
