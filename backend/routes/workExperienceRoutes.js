const express = require("express");
const router = express.Router();
const controller = require("../controllers/WorkExperienceController");

// Get all work experiences
router.get("/api/work-experiences", controller.getAllWorkExperiences);

router.get(
  "/api/work-experience/pid/:personnel_id",
  controller.getWorkExperienceByPersonnelId
);

// Add a new work experience
router.post("/api/work-experiences", controller.addWorkExperience);

// Update an existing work experience
router.put("/api/work-experiences/:id", controller.updateWorkExperience);

// Delete a work experience
router.delete("/api/work-experiences/:id", controller.deleteWorkExperience);

module.exports = router;
