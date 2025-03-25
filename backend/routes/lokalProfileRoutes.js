const express = require("express");
const router = express.Router();
const LokalProfileController = require("../controllers/lokalProfileController");

router.get("/api/lokal_profiles", LokalProfileController.getAllProfiles);
router.get("/api/lokal_profiles/:id", LokalProfileController.getProfileById);
router.post("/api/lokal_profiles", LokalProfileController.createProfile);
router.put("/api/lokal_profiles/:id", LokalProfileController.updateProfile);
router.delete("/api/lokal_profiles/:id", LokalProfileController.deleteProfile);

module.exports = router;
