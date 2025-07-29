const express = require("express");
const router = express.Router();
const languagesController = require("../controllers/languagesController");
const verifyToken = require("../middlewares/authMiddleware");
// Get all languages
router.get("/api/languages", verifyToken, languagesController.getAllLanguages);

// Get a specific language by ID
router.get(
  "/api/languages/:id",
  verifyToken,
  languagesController.getLanguageById
);

// Create a new language
router.post(
  "/api/add_languages/",
  verifyToken,
  languagesController.createLanguage
);

// Update a language by ID
router.put(
  "/api/languages/:id",
  verifyToken,
  languagesController.updateLanguage
);

// Delete a language by ID
router.delete(
  "/api/languages/:id",
  verifyToken,
  languagesController.deleteLanguage
);

module.exports = router;
