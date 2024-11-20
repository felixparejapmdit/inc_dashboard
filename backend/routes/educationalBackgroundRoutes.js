const express = require("express");
const router = express.Router();
const controller = require("../controllers/EducationalBackgroundController");

router.get(
  "/api/educational-backgrounds",
  controller.getAllEducationalBackgrounds
);
router.post(
  "/api/educational-backgrounds",
  controller.addEducationalBackground
);
router.put(
  "/api/educational-backgrounds/:id",
  controller.updateEducationalBackground
);
router.delete(
  "/api/educational-backgrounds/:id",
  controller.deleteEducationalBackground
);

module.exports = router;
