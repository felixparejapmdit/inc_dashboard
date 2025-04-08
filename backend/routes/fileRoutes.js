const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// CRUD routes for files
router.get("/api/files", fileController.getAllFiles);
router.get("/api/files/:id", fileController.getFileById);
router.post("/api/add-file", fileController.createFile);
router.put("/api/file-management/:id", fileController.updateFile);
router.delete("/api/file-management/:id", fileController.deleteFile);

module.exports = router;
