const express = require("express");
const router = express.Router();
const citizenshipsController = require("../controllers/citizenshipsController");

// CRUD routes for citizenships
router.get("/api/citizenships", citizenshipsController.getAllCitizenships);
router.get("/api/citizenships/:id", citizenshipsController.getCitizenshipById);
router.post("/api/citizenships/", citizenshipsController.createCitizenship);
router.put("/api/citizenships/:id", citizenshipsController.updateCitizenship);
router.delete(
  "/api/citizenships/:id",
  citizenshipsController.deleteCitizenship
);

module.exports = router;
