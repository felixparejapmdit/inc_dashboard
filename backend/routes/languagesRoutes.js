const express = require("express");
const router = express.Router();
const languagesController = require("../controllers/languagesController");

// Get all languages
router.get("/api/languages", languagesController.getAllLanguages);

// Get a specific language by ID
router.get("/api/languages/:id", languagesController.getLanguageById);

// Create a new language
router.post("/api/add_languages/", languagesController.createLanguage);

// Update a language by ID
router.put("/api/languages/:id", languagesController.updateLanguage);

// Delete a language by ID
router.delete("/api/languages/:id", languagesController.deleteLanguage);

module.exports = router;
