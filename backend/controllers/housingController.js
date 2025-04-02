const Housing = require("../models/Housing");

exports.getAllHousing = async (req, res) => {
  try {
    const housing = await Housing.findAll({ order: [["id", "ASC"]] });
    res.json(housing);
  } catch (error) {
    console.error("Error fetching housing:", error);
    res.status(500).json({ message: "Error fetching housing data" });
  }
};

exports.createHousing = async (req, res) => {
  const { building_name, floor, room, description } = req.body;

  if (!building_name || !floor || !room) {
    return res
      .status(400)
      .json({ message: "Building, floor, and room are required" });
  }

  try {
    const newHousing = await Housing.create({
      building_name,
      floor,
      room,
      description,
    });
    res.status(201).json(newHousing);
  } catch (error) {
    console.error("Error creating housing:", error);
    res.status(500).json({ message: "Error creating housing" });
  }
};

exports.updateHousing = async (req, res) => {
  const { id } = req.params;
  const { building_name, floor, room, description } = req.body;

  if (!building_name || !floor || !room) {
    return res
      .status(400)
      .json({ message: "Building, floor, and room are required" });
  }

  try {
    const [updated] = await Housing.update(
      { building_name, floor, room, description },
      { where: { id } }
    );

    if (!updated) return res.status(404).json({ message: "Housing not found" });

    const updatedHousing = await Housing.findByPk(id);
    res.json(updatedHousing);
  } catch (error) {
    console.error("Error updating housing:", error);
    res.status(500).json({ message: "Error updating housing" });
  }
};

exports.deleteHousing = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Housing.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: "Housing not found" });
    res.json({ message: "Housing deleted successfully" });
  } catch (error) {
    console.error("Error deleting housing:", error);
    res.status(500).json({ message: "Error deleting housing" });
  }
};
