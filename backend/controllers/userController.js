// controllers/UserController.js

// ✅ Import Redis client
const { client: redisClient, connectRedis } = require("../config/redisClient");

// Connect Redis once
connectRedis().catch((err) => console.error("Redis connection failed:", err));

const User = require("../models/User");
const Group = require("../models/Group");
const UserGroupMapping = require("../models/UserGroupMapping");
const Personnel = require("../models/personnels"); // Import your Personnel model

const axios = require("axios");
const https = require("https"); // NOTE: You'll need to import 'https' in the environment where this runs

// Environment variables
const API_URL = process.env.REACT_APP_API_URL;
// Controller function for migrating LDAP users
exports.migrateLdapToPmdLoginUsers = async (req, res) => {
    // Fetch LDAP users helper function
    const fetchLdapUsers = async () => {
        // --- CRITICAL FIX ---
        // 1. Ensure the URL starts with a protocol (http:// or https://)
        // 2. Safely join the base URL with the static path /api/ldap/users
        const base = API_URL.startsWith('http') ? API_URL : `https:${API_URL}`;
        const ldapApiUrl = `${base.replace(/\/+$/, "")}/api/ldap/users`; // Safely remove trailing slash and append path
        // --------------------

        try {
            // Note: Assuming global SSL bypass is set in server.js
            const response = await axios.get(ldapApiUrl);
            
            console.log("Fetched LDAP users:", response.data);
            return { success: true, data: response.data }; 
        } catch (error) {
            console.error("Error fetching LDAP users:", error.message);
            return { success: false, message: `Failed to connect to LDAP API at ${ldapApiUrl}. Network or certificate failure.` };
        }
    };

    try {
        const ldapResponse = await fetchLdapUsers();
        
        // CRITICAL FIX: Check the success flag from the helper function
        if (!ldapResponse.success) {
             return res.status(500).json({
                 // Use the error message that contains the full URL for better diagnosis
                message: ldapResponse.message, 
                error: "LDAP_API_CONNECTION_FAILURE",
            });
        }
        
        const ldapUsers = ldapResponse.data;

        if (!ldapUsers || ldapUsers.length === 0) {
            return res.status(200).json({ 
                message: "No LDAP users found or LDAP API returned empty list.",
            });
        }

        // Process each LDAP user
        const migrationResults = [];
        let migratedCount = 0;
        for (const ldapUser of ldapUsers) {
             if (!ldapUser.uid) continue;

             const existingUser = await User.findOne({
                 where: { username: ldapUser.uid },
             });

             if (!existingUser) {
                 const newUser = {
                     uid: ldapUser.uid,
                     personnel_id: null,
                     username: ldapUser.uid,
                     password: ldapUser.userPassword || 'LDAP_DEFAULT_PASS',
                     avatar: null,
                     isLoggedIn: 0,
                     auth_type: "LDAP",
                     failed_attempts: 0,
                     last_failed_attempt: null,
                     created_at: new Date(),
                     updated_at: new Date(),
                 };

                 await User.create(newUser);
                 migratedCount++;
                 migrationResults.push({ uid: ldapUser.uid, status: "Migrated successfully" });
             } else {
                 migrationResults.push({ uid: ldapUser.uid, status: "Already exists in users table" });
             }
        }

        // Return the migration summary
        res.status(200).json({
            message: `LDAP to PMD Login Users migration completed. ${migratedCount} new users added.`,
            results: migrationResults,
        });
    } catch (error) {
        console.error("CRITICAL DATABASE ERROR during LDAP migration:", error.message);
        // This is the final unhandled error, likely a database write failure
        res.status(500).json({
            message: "An unhandled database error occurred during the migration process.",
            error: error.message,
        });
    }
};

// Controller function for migrating LDAP users
exports.migrateLdapToPmdLoginUsers1 = async (req, res) => {
  try {
    // Fetch LDAP users
    const fetchLdapUsers = async () => {
      try {
        
        const response = await axios.get(`${API_URL}/api/ldap/users`);
        console.log("Fetched LDAP users:", response.data);
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

exports.getAllLoginUsers = async (req, res) => {
  const cacheKey = "all_login_users";

  try {
      // 1️⃣ Check Redis cache
    const cachedUsers = await redisClient.get(cacheKey);
    if (cachedUsers) {
      console.log("📦 Serving all login users from Redis cache");
      return res.status(200).json(JSON.parse(cachedUsers));
    }

    const users = await User.findAll({
      attributes: ["id", "username", "avatar", "isLoggedIn", "last_login"],
    });

    // ✅ Format data to include readable online status
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      last_login: user.last_login,
      isLoggedIn: user.isLoggedIn,
      status: user.isLoggedIn === 1 ? "Online" : "Offline",
    }));

     const responseData = {
      success: true,
      total: formattedUsers.length,
      data: formattedUsers,
    };

    // 3️⃣ Cache in Redis for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });
    console.log("✅ All login users cached in Redis");

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
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

    const cacheKey = `user_${username}`;

    // 1️⃣ Check Redis cache
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      console.log(`📦 Serving user ${username} from Redis cache`);
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "User not found." });
    }

    res.setHeader("Content-Type", "application/json");

       const userData = {
      id: user.id,
      username: user.username,
      email: user.email || null,
      isLoggedIn: user.isLoggedIn,
    };

    // 3️⃣ Store in Redis for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(userData), { EX: 3600 });
    console.log(`✅ User ${username} cached in Redis`);

    return res.status(200).json(userData);

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
  const { personnel_id, personnel_progress, rfid_code } = req.body;

  if (!personnel_id || (!personnel_progress && !rfid_code)) {
    return res.status(400).json({
      message: "Personnel ID and at least one of progress stage or RFID code is required.",
    });
  }
  try {
    console.log("Checking if User model is defined:", User !== undefined); // Debugging
    console.log("Searching for user with ID:", personnel_id);

    const user = await Personnel.findOne({ where: { personnel_id } });

    if (!user) {
      return res.status(404).json({ message: "Personnel not found." });
    }

    await user.update({
      personnel_progress,
      ...(rfid_code && { rfid_code }), // only update if rfid_code is provided
    });

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
