const express = require("express");
const router = express.Router();
const personnelsController = require("../controllers/personnelsController");

// Route to get all personnels
router.get("/api/personnels", personnelsController.getAllPersonnels);

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

// Route to update a personnel by ID
router.put("/api/personnels/:id", personnelsController.updatePersonnel);

// Route to delete a personnel by ID
router.delete("/api/personnels/:id", personnelsController.deletePersonnel);

module.exports = router;
