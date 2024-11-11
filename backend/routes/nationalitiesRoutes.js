const express = require("express");
const router = express.Router();
const nationalitiesController = require("../controllers/nationalitiesController");

// CRUD routes for nationalities
router.get("/api/nationalities", nationalitiesController.getAllNationalities);
router.get(
  "/api/nationalities/:id",
  nationalitiesController.getNationalityById
);
router.post("/api/nationalities/", nationalitiesController.createNationality);
router.put("/api/nationalities/:id", nationalitiesController.updateNationality);
router.delete(
  "/api/nationalities/:id",
  nationalitiesController.deleteNationality
);

module.exports = router;
