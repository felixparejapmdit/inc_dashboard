const express = require("express");
const router = express.Router();
const citizenshipsController = require("../controllers/citizenshipsController");

const verifyToken = require("../middlewares/authMiddleware");

// CRUD routes for citizenships
router.get(
  "/api/citizenships",
  verifyToken,
  citizenshipsController.getAllCitizenships
);
router.get("/api/citizenships/:id", citizenshipsController.getCitizenshipById);
router.post(
  "/api/citizenships/",
  verifyToken,
  citizenshipsController.createCitizenship
);
router.put(
  "/api/citizenships/:id",
  verifyToken,
  citizenshipsController.updateCitizenship
);
router.delete(
  "/api/citizenships/:id",
  verifyToken,
  citizenshipsController.deleteCitizenship
);

module.exports = router;
