// controllers/UserController.js

const User = require("../models/User");
const Group = require("../models/Group");
const UserGroupMapping = require("../models/UserGroupMapping");
const Personnel = require("../models/personnels"); // Import your Personnel model

exports.assignGroup = async (req, res) => {
  const { userId } = req.params;
  const { groupId } = req.body;

  try {
    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Delete existing mappings for the user
    await UserGroupMapping.destroy({
      where: {
        user_id: userId,
      },
    });

    // Create a new mapping for the user and the assigned group
    await UserGroupMapping.create({
      user_id: userId,
      group_id: groupId,
    });

    res.status(200).json({ message: "Group assigned successfully" });
  } catch (error) {
    console.error("Error assigning group:", error);
    res.status(500).json({ message: "Error assigning group", error });
  }
};

// Fetch user details by username
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ message: "Error fetching user.", error });
  }
};

exports.updateProgress = async (req, res) => {
  const { personnel_id, personnel_progress } = req.body;

  if (!personnel_id || !personnel_progress) {
    return res.status(400).json({
      message: "Personnel ID and progress stage are required.",
    });
  }

  try {
    console.log("Checking if User model is defined:", User !== undefined); // Debugging
    console.log("Searching for user with ID:", personnel_id);

    const user = await Personnel.findOne({ where: { personnel_id } });

    if (!user) {
      return res.status(404).json({ message: "Personnel not found." });
    }

    await user.update({ personnel_progress });

    res.status(200).json({
      message: "Personnel's progress updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating personnel progress:", error);
    res.status(500).json({
      message: "Internal server error. Failed to update progress.",
      error: error.message,
    });
  }
};
