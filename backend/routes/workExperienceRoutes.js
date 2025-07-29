const express = require("express");
const router = express.Router();
const controller = require("../controllers/WorkExperienceController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all work experiences
router.get(
  "/api/work-experiences",
  verifyToken,
  controller.getAllWorkExperiences
);

router.get(
  "/api/work-experience/pid/:personnel_id",
  verifyToken,
  controller.getWorkExperienceByPersonnelId
);

// Add a new work experience
router.post("/api/work-experiences", verifyToken, controller.addWorkExperience);

// Update an existing work experience
router.put(
  "/api/work-experiences/:id",
  verifyToken,
  controller.updateWorkExperience
);

// Delete a work experience
router.delete(
  "/api/work-experiences/:id",
  verifyToken,
  controller.deleteWorkExperience
);

module.exports = router;
