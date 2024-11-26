const Group = require("../models/Group");

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving groups", error });
  }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving group", error });
  }
};

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const newGroup = await Group.create(req.body);
    res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
};

// Update a group by ID
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    await group.update(req.body);
    res.status(200).json({ message: "Group updated successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error updating group", error });
  }
};

// Delete a group by ID
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    await group.destroy();
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting group", error });
  }
};
