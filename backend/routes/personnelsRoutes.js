const express = require("express");
const router = express.Router();
const db = require("../db");

const personnelsController = require('../controllers/personnelsController');

// Get all personnels
router.get('/', personnelsController.getAllPersonnels);

// Get a single personnel by ID
router.get('/:id', personnelsController.getPersonnelById);

// Create a new personnel
router.post('/', personnelsController.createPersonnel);

// Update a personnel by ID
router.put('/:id', personnelsController.updatePersonnel);

// Delete a personnel by ID
router.delete('/:id', personnelsController.deletePersonnel);

module.exports = router;
