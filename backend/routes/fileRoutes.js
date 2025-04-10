const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController"); // Ensure the correct import
const { shareFile } = require("../services/fileShareService"); // Import shareFile function from the appropriate service

// CRUD routes for files
router.get("/api/files", fileController.getAllFiles);
router.get("/api/files/:id", fileController.getFileById);
// Get files by user ID
router.get("/api/files/user/:userId", fileController.getFileByUserID);

router.get("/api/files/:id/shared-users", fileController.getSharedUsers);

router.post("/api/add-file", fileController.createFile);
router.put("/api/file-management/:id", fileController.updateFile);
router.delete("/api/file-management/:id", fileController.deleteFile);

// Share file with multiple users
router.post("/api/files/share", async (req, res) => {
  const { file_id, user_ids } = req.body; // expects user_ids as an array

  if (!file_id || !Array.isArray(user_ids) || user_ids.length === 0) {
    return res.status(400).json({
      message: "file_id and at least one user_id are required.",
    });
  }

  try {
    const results = await Promise.all(
      user_ids.map((user_id) => fileController.shareFile(file_id, user_id))
    );

    const success = results.filter(
      (r) => r.message === "File shared successfully."
    );
    const alreadyShared = results.filter((r) =>
      r.message.includes("already shared")
    );

    res.status(200).json({
      message: "Sharing process completed.",
      sharedWith: success.map((r) => r.data?.user_id),
      alreadySharedWith: alreadyShared.map((r, idx) => user_ids[idx]),
    });
  } catch (error) {
    console.error("Error sharing file:", error);
    res.status(500).json({
      message: "Failed to share file with selected users.",
      error: error.message,
    });
  }
});

module.exports = router;
