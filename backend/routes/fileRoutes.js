const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController"); // Ensure the correct import
const { shareFile } = require("../services/fileShareService"); // Import shareFile function from the appropriate service

// CRUD routes for files
router.get("/api/files", fileController.getAllFiles);
router.get("/api/files/:id", fileController.getFileById);
// Get files by user ID
router.get("/api/files/user/:userId", fileController.getFileByUserID);
router.post("/api/add-file", fileController.createFile);
router.put("/api/file-management/:id", fileController.updateFile);
router.delete("/api/file-management/:id", fileController.deleteFile);

// Share file route
router.post("/api/files/share", async (req, res) => {
  const { file_id, user_id } = req.body;

  if (!file_id || !user_id) {
    return res.status(400).json({
      message: "Both file_id and user_id are required.",
    });
  }

  try {
    const result = await fileController.shareFile(file_id, user_id);
    res
      .status(result.message === "File shared successfully." ? 200 : 400)
      .json(result);
  } catch (error) {
    console.error("Share route error:", error);
    res.status(500).json({
      message: "Error sharing file.",
      error: error.message,
    });
  }
});

module.exports = router;
