const express = require("express");
const router = express.Router();
const personnelsController = require("../controllers/personnelsController");
const verifyToken = require("../middlewares/authMiddleware");

// Route to get all personnels
router.get(
  "/api/personnels",
  verifyToken,
  personnelsController.getAllPersonnels
);

// Route to get soft-deleted personnel
router.get(
  "/api/personnels/deleted",
  verifyToken,
  personnelsController.getDeletedPersonnels
);

// Route to get church duties by personnel ID
router.get(
  "/api/church-duties/:personnelId",
  verifyToken,
  personnelsController.getPersonnelDutiesByPersonnelId
);

// Route to get all new personnel
router.get(
  "/api/personnels/new",
  verifyToken,
  personnelsController.getAllNewPersonnels
);

// Route to get personnels by progress
router.get(
  "/api/personnels/progress/:step",
  verifyToken,
  personnelsController.getPersonnelsByProgress
);

// Route to get a specific personnel by ID
router.get(
  "/api/personnels/:id",
  verifyToken,
  personnelsController.getPersonnelById
);

// Route to create a new personnel
router.post(
  "/api/personnels",
  verifyToken,
  personnelsController.createPersonnel
);

// Route to retrieve reference number based on name and date of birth
router.get(
  "/api/getretrievereference",
  verifyToken,
  personnelsController.getReferenceNumber
);

// Route to get a personnel by reference number or all
router.get(
  "/api/getreference",
  verifyToken,
  personnelsController.getPersonnelByReferenceNumber
);

// Route to get user credentials based on personnel_id
router.get(
  "/api/get-user-credentials",
  verifyToken,
  personnelsController.getUserCredentials
);

// Route to check if a personnel exists
router.get(
  "/api/personnels_check",
  verifyToken,
  personnelsController.checkPersonnelExistence
);

// Route to restore a soft-deleted personnel
router.put(
  "/api/personnels/restore/:id",
  verifyToken,
  personnelsController.restorePersonnel
);

// Route to update a personnel by ID
router.put(
  "/api/personnels/:id",
  verifyToken,
  personnelsController.updatePersonnel
);

// Route to delete a personnel by ID
router.delete(
  "/api/personnels/:id",
  verifyToken,
  personnelsController.deletePersonnel
);

// Create a new church duty
router.post(
  "/api/personnel_church_duties",
  verifyToken,
  personnelsController.createPersonnelChurchDuty
);

// Update an existing church duty
router.put(
  "/api/personnel_church_duties/:id",
  verifyToken,
  personnelsController.updatePersonnelChurchDuty
);

// Delete a church duty
router.delete(
  "/api/personnel_church_duties/:id",
  verifyToken,
  personnelsController.deletePersonnelChurchDuty
);

module.exports = router;
