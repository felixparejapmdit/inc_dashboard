// controllers/UserController.js

const User = require("../models/User");
const Group = require("../models/Group");
const UserGroupMapping = require("../models/UserGroupMapping");

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
