const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

const verifyToken = require("../middlewares/authMiddleware");

// GET the current Drag & Drop setting
router.get(
  "/settings/drag-drop",
  verifyToken,
  settingsController.getDragDropSetting
);

// PUT to update the setting
router.put(
  "/settings/drag-drop",
  verifyToken,
  settingsController.updateDragDropSetting
);

module.exports = router;
