const { Personnel } = require('../models'); // Assuming `Personnel` is defined in your models

// Get all personnels
exports.getAllPersonnels = async (req, res) => {
    try {
        const personnels = await Personnel.findAll();
        res.status(200).json(personnels);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving personnels', error });
    }
};

// Get a single personnel by ID
exports.getPersonnelById = async (req, res) => {
    try {
        const personnel = await Personnel.findByPk(req.params.id);
        if (!personnel) return res.status(404).json({ message: 'Personnel not found' });
        res.status(200).json(personnel);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving personnel', error });
    }
};

// Create a new personnel
exports.createPersonnel = async (req, res) => {
    try {
        const newPersonnel = await Personnel.create(req.body);
        res.status(201).json(newPersonnel);
    } catch (error) {
        res.status(400).json({ message: 'Error creating personnel', error });
    }
};

// Update a personnel by ID
exports.updatePersonnel = async (req, res) => {
    try {
        const personnel = await Personnel.findByPk(req.params.id);
        if (!personnel) return res.status(404).json({ message: 'Personnel not found' });

        await personnel.update(req.body);
        res.status(200).json(personnel);
    } catch (error) {
        res.status(400).json({ message: 'Error updating personnel', error });
    }
};

// Delete a personnel by ID
exports.deletePersonnel = async (req, res) => {
    try {
        const personnel = await Personnel.findByPk(req.params.id);
        if (!personnel) return res.status(404).json({ message: 'Personnel not found' });

        await personnel.destroy();
        res.status(200).json({ message: 'Personnel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting personnel', error });
    }
};
