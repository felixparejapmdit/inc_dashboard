const UserGroupMapping = require("../models/UserGroupMapping");

exports.updateUserGroup = async (req, res) => {
  try {
    const { group_id } = req.body;
    const userId = req.params.userId;

    console.log("Updating user group:", { userId, group_id });

    // Validate input
    if (!group_id) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Check if the mapping exists
    const mapping = await UserGroupMapping.findOne({
      where: { user_id: userId },
    });

    if (!mapping) {
      return res.status(404).json({ message: "User group mapping not found" });
    }

    // Update the group_id
    mapping.group_id = group_id; // Update the instance in memory
    await mapping.save(); // Persist the changes to the database

    res.status(200).json({
      message: "User group updated successfully111",
      updatedMapping: mapping,
    });
  } catch (error) {
    console.error("Error updating user group:", error);
    res.status(500).json({ message: "Error updating user group", error });
  }
};
