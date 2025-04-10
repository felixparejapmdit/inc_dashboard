// services/fileShareService.js
const FileShare = require("../models/FileShare");

async function shareFile(file_id, user_id) {
  try {
    const existingShare = await FileShare.findOne({
      where: { file_id, user_id },
    });

    if (existingShare) {
      return { message: "File is already shared with this user." };
    }

    const newShare = await FileShare.create({
      file_id,
      user_id,
    });

    return { message: "File shared successfully.", data: newShare };
  } catch (error) {
    console.error("Error in shareFile:", error);
    throw error;
  }
}

module.exports = { shareFile };
