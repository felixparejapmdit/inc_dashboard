const express = require("express");
const router = express.Router();
const suguanController = require("../controllers/suguanController");

// Get all Suguan entries
router.get("/suguan", suguanController.getAllSuguan);

// Get a single Suguan entry by ID
router.get("/suguan/:id", suguanController.getSuguanById);

// Create a new Suguan entry
router.post("/suguan", suguanController.createSuguan);

// Update a Suguan entry by ID
router.put("/suguan/:id", suguanController.updateSuguan);

// Delete a Suguan entry by ID
router.delete("/suguan/:id", suguanController.deleteSuguan);

module.exports = router;
