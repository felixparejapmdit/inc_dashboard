const express = require("express");
const router = express.Router();
const controller = require("../controllers/WorkExperienceController");

router.get("/api/work-experiences", controller.getAllWorkExperiences);
router.post("/api/work-experiences", controller.addWorkExperience);
router.put("/api/work-experiences/:id", controller.updateWorkExperience);
router.delete("/api/work-experiences/:id", controller.deleteWorkExperience);

module.exports = router;
