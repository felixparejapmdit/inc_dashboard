const Location = require("../models/Location");

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({ order: [["name", "ASC"]] }); // Order locations alphabetically
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error fetching locations", error });
  }
};

// Get a single location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ message: `Location with ID ${req.params.id} not found` });
    }
    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ message: "Error fetching location", error });
  }
};

// Add a new location
exports.createLocation = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Location name is required" });
    }

    const newLocation = await Location.create({ name });
    res
      .status(201)
      .json({ message: "Location created successfully", newLocation });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ message: "Error creating location", error });
  }
};

// Update a location by ID
exports.updateLocation = async (req, res) => {
  try {
    const { name } = req.body;

    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ message: `Location with ID ${req.params.id} not found` });
    }

    if (name) location.name = name;

    await location.save();
    res
      .status(200)
      .json({ message: "Location updated successfully", location });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Error updating location", error });
  }
};

// Delete a location by ID
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ message: `Location with ID ${req.params.id} not found` });
    }

    await location.destroy();
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ message: "Error deleting location", error });
  }
};
