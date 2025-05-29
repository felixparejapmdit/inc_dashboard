// controllers/UserController.js

const User = require("../models/User");
const Group = require("../models/Group");
const UserGroupMapping = require("../models/UserGroupMapping");
const Personnel = require("../models/personnels"); // Import your Personnel model

const axios = require("axios");

// Environment variables
const API_URL = process.env.REACT_APP_API_URL;

// Controller function for migrating LDAP users
exports.migrateLdapToPmdLoginUsers = async (req, res) => {
  try {
    // Fetch LDAP users
    const fetchLdapUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/ldap/users`);
        return response.data; // Assuming the API response is an array of LDAP user objects
      } catch (error) {
        console.error("Error fetching LDAP users:", error);
        throw new Error("Failed to fetch LDAP users.");
      }
    };

    const ldapUsers = await fetchLdapUsers();

    if (!ldapUsers || ldapUsers.length === 0) {
      return res.status(404).json({
        message: "No LDAP users found or unable to connect to LDAP API.",
      });
    }

    // Process each LDAP user
    const migrationResults = [];
    for (const ldapUser of ldapUsers) {
      // Check if the user already exists in the users table by UID
      const existingUser = await User.findOne({
        where: { username: ldapUser.uid },
      });

      if (!existingUser) {
        // Map LDAP data to user fields
        const newUser = {
          uid: ldapUser.uid,
          personnel_id: null, // Set to null or map if personnel_id exists elsewhere
          username: ldapUser.uid,
          password: ldapUser.userPassword, // Assuming password format matches
          avatar: null, // Set avatar if needed
          isLoggedIn: 0, // Default to not logged in
          last_login: null,
          auth_type: "LDAP", // LDAP as the auth type
          failed_attempts: 0, // Initialize failed attempts
          last_failed_attempt: null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Insert the new user
        await User.create(newUser);
        migrationResults.push({
          uid: ldapUser.uid,
          status: "Migrated successfully",
        });
      } else {
        migrationResults.push({
          uid: ldapUser.uid,
          status: "Already exists in users table",
        });
      }
    }

    // Return the migration summary
    res.status(200).json({
      message: "LDAP to PMD Login Users migration completed.",
      results: migrationResults,
    });
  } catch (error) {
    console.error("Error during LDAP migration:", error.message);
    res.status(500).json({
      message: "An error occurred during the migration process.",
      error: error.message,
    });
  }
};

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
// controllers/UserController.js
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ message: "Username is required." });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "User not found." });
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email || null,
    });
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      message: "Error fetching user.",
      error: error.message || error,
    });
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
