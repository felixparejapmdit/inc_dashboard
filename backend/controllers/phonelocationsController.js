const PhoneLocation = require("../models/PhoneLocation");

// Get all locations
exports.getAllPhoneLocations = async (req, res) => {
  try {
    const locations = await PhoneLocation.findAll({ order: [["name", "ASC"]] }); // Order locations alphabetically
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error fetching locations", error });
  }
};

// Get a single location by ID
exports.getPhoneLocationById = async (req, res) => {
  try {
    const location = await PhoneLocation.findByPk(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ message: `PhoneLocation with ID ${req.params.id} not found` });
    }
    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ message: "Error fetching location", error });
  }
};

// Add a new location
exports.createPhoneLocation = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "PhoneLocation name is required" });
    }

    const newPhoneLocation = await PhoneLocation.create({ name });
    res.status(201).json({
      message: "PhoneLocation created successfully",
      newPhoneLocation,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ message: "Error creating location", error });
  }
};

// Update a location by ID
exports.updatePhoneLocation = async (req, res) => {
  try {
    const { name } = req.body;

    const location = await PhoneLocation.findByPk(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ message: `PhoneLocation with ID ${req.params.id} not found` });
    }

    if (name) location.name = name;

    await location.save();
    res
      .status(200)
      .json({ message: "PhoneLocation updated successfully", location });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Error updating location", error });
  }
};

// Delete a location by ID
exports.deletePhoneLocation = async (req, res) => {
  try {
    const location = await PhoneLocation.findByPk(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ message: `PhoneLocation with ID ${req.params.id} not found` });
    }

    await location.destroy();
    res.status(200).json({ message: "PhoneLocation deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ message: "Error deleting location", error });
  }
};
