// services/fileShareService.js
const FileShare = require("../models/FileShare"); // Import the FileShare model

// Function to share a file
async function shareFile(file_id, user_id) {
  try {
    // Check if the file is already shared with the user
    const existingShare = await FileShare.findOne({
      where: { file_id, user_id },
    });

    if (existingShare) {
      return { message: "File is already shared with this user." };
    }

    // Create a new share relationship if it doesn't exist
    const newShare = await FileShare.create({
      file_id,
      user_id,
    });

    return { message: "File shared successfully.", data: newShare };
  } catch (error) {
    console.error("Error in shareFile:", error);
    throw error; // This will be caught by the controller
  }
}

module.exports = { shareFile };
