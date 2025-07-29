const express = require("express");
const router = express.Router();
const nationalitiesController = require("../controllers/nationalitiesController");

const verifyToken = require("../middlewares/authMiddleware");

// CRUD routes for nationalities
router.get(
  "/api/nationalities",
  verifyToken,
  nationalitiesController.getAllNationalities
);
router.get(
  "/api/nationalities/:id",
  verifyToken,
  nationalitiesController.getNationalityById
);
router.post(
  "/api/nationalities/",
  verifyToken,
  nationalitiesController.createNationality
);
router.put(
  "/api/nationalities/:id",
  verifyToken,
  nationalitiesController.updateNationality
);
router.delete(
  "/api/nationalities/:id",
  verifyToken,
  nationalitiesController.deleteNationality
);

module.exports = router;
