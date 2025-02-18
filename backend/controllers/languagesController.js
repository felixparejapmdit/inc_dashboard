const Language = require("../models/language");

// Get all unique languages grouped by country
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      attributes: ["name", "country_name"],
      group: ["name", "country_name"], // Ensures uniqueness
      order: [["name", "ASC"]], // Sort alphabetically
    });

    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving languages", error });
  }
};

// Get a single language by ID
exports.getLanguageById = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    res.status(200).json(language);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving language", error });
  }
};

// Create a new language
exports.createLanguage = async (req, res) => {
  try {
    const newLanguage = await Language.create(req.body);
    res.status(201).json(newLanguage);
  } catch (error) {
    res.status(500).json({ message: "Error creating language", error });
  }
};

// Update a language by ID
exports.updateLanguage = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    await language.update(req.body);
    res.status(200).json(language);
  } catch (error) {
    res.status(500).json({ message: "Error updating language", error });
  }
};

// Delete a language by ID
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    await language.destroy();
    res.status(200).json({ message: "Language deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting language", error });
  }
};
