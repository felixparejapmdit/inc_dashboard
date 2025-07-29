// routes/appRoutes.js
const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all apps
router.get("/api/apps", verifyToken, appController.getAllApps);

// Get available apps for the logged-in user
router.get("/api/apps/available", appController.getAvailableApps);

// Add a new app
router.post("/api/apps", appController.addApp);

// Update an existing app
router.put("/api/apps/:id", verifyToken, appController.updateApp);

// Delete an app
router.delete("/api/apps/:id", appController.deleteApp);

module.exports = router;
