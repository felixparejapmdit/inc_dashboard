//const { Group, UserGroupMapping, User } = require("../models");

const Group = require("../models/Group");
const UserGroupMapping = require("../models/UserGroupMapping");
const User = require("../models/User");
const axios = require("axios"); // Ensure Axios is installed and available

const Permission = require("../models/PermissionDefinition");
const PermissionCategory = require("../models/PermissionCategory");
const GroupPermissionMapping = require("../models/GroupPermissionMapping");
const PermissionDefinition = require("../models/PermissionDefinition");

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      order: [["name", "ASC"]], // Order by 'name' in ascending order
    });
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

// Get users in a specific group
exports.getGroupUsers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    console.log(`Fetching users for group ID: ${groupId}`);

    // Fetch user mappings for the group
    const userMappings = await UserGroupMapping.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username"],
        },
      ],
      order: [["User", "username", "ASC"]],
    });

    console.log("User Mappings:", userMappings);

    // Fetch additional data from LDAP API
    let ldapUsers = [];
    try {
      const ldapResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ldap/users`
      );
      ldapUsers = ldapResponse.data;
    } catch (ldapError) {
      console.error("Error fetching LDAP users:", ldapError);
    }

    // Map database user data with LDAP user data
    const users = userMappings.map((mapping) => {
      if (!mapping.User) {
        console.warn("Warning: Null User detected for mapping:", mapping);
        return {
          id: "N/A",
          username: "Unknown",
          fullname: "N/A",
          email: "N/A",
        };
      }
      const ldapUser = ldapUsers.find(
        (ldap) => ldap.uid === mapping.User.username
      );
      return {
        id: mapping.User.id,
        username: mapping.User.username,
        fullname: ldapUser ? `${ldapUser.givenName} ${ldapUser.sn}` : "N/A",
        email: ldapUser ? ldapUser.mail : "N/A",
      };
    });

    console.log("Final Users Data:", users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving group users:", error);
    res.status(500).json({ message: "Error retrieving group users", error });
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
exports.updateUserGroup = async (req, res) => {
  try {
    const { group_id } = req.body;
    const userId = req.params.userId;

    console.log("Request body:", req.body);
    console.log("User ID:", userId);
    console.log("Updating group_id to:", group_id);

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
    await mapping.update({ group_id });

    res.status(200).json({
      message: "User group updated successfully",
      updatedMapping: mapping,
    });
  } catch (error) {
    console.error("Error updating user group:", error);
    res.status(500).json({ message: "Error updating user group", error });
  }
};

exports.getGroupPermissions = async (req, res) => {
  const groupId = req.params.id;

  try {
    // Ensure the group exists
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Fetch permissions for the group
    const permissions = await GroupPermissionMapping.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: PermissionDefinition,
          as: "permission",
          attributes: ["id", "name"],
        },
        {
          model: PermissionCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    const formattedPermissions = permissions.map((perm) => ({
      id: perm.permission.id,
      name: perm.permission.name,
      categoryId: perm.category.id,
      categoryName: perm.category.name,
      accessrights: perm.accessrights,
    }));

    res.status(200).json(formattedPermissions);
  } catch (error) {
    console.error("Error fetching group permissions:", error);
    res.status(500).json({ message: "Error fetching permissions" });
  }
};

// Get group ID for a specific user
exports.getGroupIdByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const mapping = await UserGroupMapping.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Group,
          as: "Group",
          attributes: ["name"],
        },
      ],
    });

    if (!mapping) {
      return res
        .status(404)
        .json({ message: "Group mapping not found for the user." });
    }

    res.status(200).json({
      groupId: mapping.group_id,
      groupName: mapping.Group ? mapping.Group.name : "N/A"
    });
  } catch (error) {
    console.error("Error fetching group ID for user:", error);
    res.status(500).json({ message: "Error fetching group ID", error });
  }
};
