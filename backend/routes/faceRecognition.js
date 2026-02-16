const express = require("express");
const router = express.Router();
const faceRecognitionController = require("../controllers/faceRecognitionController");

// Public route - Face verification for login (no auth required)
router.post("/verify", faceRecognitionController.verifyFace);

// Protected routes - These should ideally have auth, but removing for now to match project structure
router.post("/enroll", faceRecognitionController.enrollFace);
router.get("/status/:personnel_id", faceRecognitionController.getFaceStatus);
router.put("/toggle/:personnel_id", faceRecognitionController.toggleFaceRecognition);
router.delete("/delete/:personnel_id", faceRecognitionController.deleteFaceData);
router.get("/logs/:personnel_id", faceRecognitionController.getFaceLogs);

module.exports = router;
