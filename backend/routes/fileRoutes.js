const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController"); // Ensure the correct import
const { shareFile } = require("../services/fileShareService"); // Import shareFile function from the appropriate service
const upload = require("../middlewares/upload"); // path to your upload config

const verifyToken = require("../middlewares/authMiddleware");

// CRUD routes for files
router.get("/api/files", verifyToken, fileController.getAllFiles);
router.get("/api/files/:id", verifyToken, fileController.getFileById);
// Get files by user ID
router.get(
  "/api/files/user/:userId",
  verifyToken,
  fileController.getFileByUserID
);

router.get(
  "/api/files/:id/shared-users",
  verifyToken,
  fileController.getSharedUsers
);

// router.post("/api/add-file", fileController.createFile);
// router.put("/api/file-management/:id", fileController.updateFile);
router.delete(
  "/api/file-management/:id",
  verifyToken,
  fileController.deleteFile
);

// POST: Add File (with thumbnail)
router.post(
  "/api/add-file",
  upload.single("thumbnail"),
  verifyToken,
  fileController.createFile
);

// PUT: Update File
router.put(
  "/file-management/:id",
  upload.single("thumbnail"),
  verifyToken,
  fileController.updateFile
);

// Share file with multiple users
router.post("/api/files/share", verifyToken, async (req, res) => {
  const { file_id, user_ids } = req.body;

  if (!file_id || !Array.isArray(user_ids) || user_ids.length === 0) {
    return res.status(400).json({
      message: "file_id and at least one user_id are required.",
    });
  }

  try {
    const results = await Promise.all(
      user_ids.map((user_id) => fileController.shareFile(file_id, user_id))
    );

    const sharedWith = [];
    const alreadySharedWith = [];

    results.forEach((result) => {
      if (result.message === "File shared successfully.") {
        sharedWith.push(result.data.user_id);
      } else if (result.message.includes("already shared")) {
        alreadySharedWith.push(result.data.user_id);
      }
    });

    res.status(200).json({
      message: "Sharing process completed.",
      sharedWith,
      alreadySharedWith, // 🔁 This is what your frontend needs
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
