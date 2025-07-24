const express = require("express");
const router = express.Router();
const personnelsController = require("../controllers/personnelsController");
const verifyToken = require("../middlewares/authMiddleware");

// Route to get all personnels
router.get("/api/personnels", verifyToken, personnelsController.getAllPersonnels);

// Route to get soft-deleted personnel
router.get("/api/personnels/deleted", personnelsController.getDeletedPersonnels);

// Route to get church duties by personnel ID
router.get(
  "/api/church-duties/:personnelId",
  personnelsController.getPersonnelDutiesByPersonnelId
);

// Route to get all new personnel
router.get("/api/personnels/new", personnelsController.getAllNewPersonnels);

// Route to get personnels by progress
router.get(
  "/api/personnels/progress/:step",
  personnelsController.getPersonnelsByProgress
);

// Route to get a specific personnel by ID
router.get("/api/personnels/:id", personnelsController.getPersonnelById);

// Route to create a new personnel
router.post("/api/personnels", personnelsController.createPersonnel);

// Route to retrieve reference number based on name and date of birth
router.get(
  "/api/getretrievereference",
  personnelsController.getReferenceNumber
);

// Route to get a personnel by reference number or all
router.get(
  "/api/getreference",
  personnelsController.getPersonnelByReferenceNumber
);

// Route to get user credentials based on personnel_id
router.get(
  "/api/get-user-credentials",
  personnelsController.getUserCredentials
);

// Route to check if a personnel exists
router.get(
  "/api/personnels_check",
  personnelsController.checkPersonnelExistence
);


// Route to restore a soft-deleted personnel
router.put("/api/personnels/restore/:id", personnelsController.restorePersonnel);

// Route to update a personnel by ID
router.put("/api/personnels/:id", personnelsController.updatePersonnel);

// Route to delete a personnel by ID
router.delete("/api/personnels/:id", personnelsController.deletePersonnel);

// Create a new church duty
router.post(
  "/api/personnel_church_duties",
  personnelsController.createPersonnelChurchDuty
);

// Update an existing church duty
router.put(
  "/api/personnel_church_duties/:id",
  personnelsController.updatePersonnelChurchDuty
);

// Delete a church duty
router.delete(
  "/api/personnel_church_duties/:id",
  personnelsController.deletePersonnelChurchDuty
);



module.exports = router;
