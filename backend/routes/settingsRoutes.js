const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

// GET the current Drag & Drop setting
router.get("/api/settings/drag-drop/", settingsController.getDragDropSetting);

// POST/PUT to update the setting
router.put(
  "/api/settings/drag-drop/",
  settingsController.updateDragDropSetting
);

module.exports = router;
