const express = require("express");
const router = express.Router();
const housingController = require("../controllers/housingController");

const verifyToken = require("../middlewares/authMiddleware");

// GET all housing entries
router.get("/api/housing", verifyToken, housingController.getAllHousing);

// Optional: GET a single housing entry by ID (uncomment if needed)
// router.get("/api/housing/:id", verifyToken, housingController.getHousingById);

// POST a new housing entry
router.post("/api/housing", verifyToken, housingController.createHousing);

// PUT update an existing housing entry
router.put("/api/housing/:id", verifyToken, housingController.updateHousing);

// DELETE a housing entry
router.delete("/api/housing/:id", verifyToken, housingController.deleteHousing);

module.exports = router;
