const express = require("express");
const router = express.Router();
const suguanController = require("../controllers/suguanController");

// Get all Suguan entries
router.get("/api/suguan", suguanController.getAllSuguan);

// Get a single Suguan entry by ID
router.get("/api/suguan/:id", suguanController.getSuguanById);

// Create a new Suguan entry
router.post("/api/suguan", suguanController.createSuguan);

// Update a Suguan entry by ID
router.put("/api/suguan/:id", suguanController.updateSuguan);

// Delete a Suguan entry by ID
router.delete("/api/suguan/:id", suguanController.deleteSuguan);

module.exports = router;
