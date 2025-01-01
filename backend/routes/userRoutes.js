const express = require("express");
const router = express.Router();
const db = require("../db");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Personnel = require("../models/personnels");
const UserController = require("../controllers/userController");

//const db1 = require("../config/database");
const axios = require("axios");

//const ldap = require("ldapjs");
//const LDAP_URL = process.env.LDAP_URL;
// const BIND_DN = process.env.BIND_DN;
// const BIND_PASSWORD = process.env.BIND_PASSWORD;
// const BASE_DN = process.env.BASE_DN;

// Utility to create an LDAP client
const createLdapClient = () => {
  const ldap = require("ldapjs");

  const client = ldap.createClient({
    url: process.env.LDAP_URL,
    timeout: 5000, // 5 seconds timeout for operations
    connectTimeout: 5000, // 5 seconds for connection timeout
    reconnect: {
      initialDelay: 1000, // Start with a 1-second delay
      maxDelay: 60000, // Maximum delay of 1 minute
      failAfter: 5, // Fail after 5 attempts
    },
  });

  // Catch any connection errors and prevent crashing
  client.on("error", (err) => {
    console.error("LDAP client error:", err.message);
  });

  client.on("connect", () => {
    console.log("LDAP client connected successfully.");
  });

  return client;
};

// Function to verify SSHA hash
function verifySSHA(password, hash) {
  const salt = Buffer.from(hash.slice(6), "base64").slice(-20);
  const derivedHash = crypto
    .createHash("sha1")
    .update(password)
    .update(salt)
    .digest("base64");
  return `{SSHA}${derivedHash + salt.toString("base64")}` === hash;
}

// Function to verify MD5 hash
function verifyMD5(password, hash) {
  const derivedHash = `{MD5}${crypto
    .createHash("md5")
    .update(password)
    .digest("base64")}`;
  return derivedHash === hash;
}

router.put("/api/users/:userId/assign-group", UserController.assignGroup);

router.get("/api/users_access/:username", UserController.getUserByUsername);

// Update user's progress stage
router.put("/api/users/update-progress", UserController.updateProgress);

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatar"); // Save files in the "uploads/avatars" directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Add an endpoint for avatar uploads
router.put(
  "/api/users/:userId/avatar",
  upload.single("avatar"),
  async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update the user's avatar column
      user.avatar = `/uploads/${req.file.filename}`;
      await user.save();

      res
        .status(200)
        .json({ message: "Avatar updated successfully", avatar: user.avatar });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Error updating avatar", error });
    }
  }
);

// Update user's personnel_id
router.put("/api/users/update", async (req, res) => {
  const { username, personnel_id } = req.body;

  // Validate input
  if (!username || !personnel_id) {
    return res.status(400).json({
      message: "Username and personnel_id are required to update the user.",
    });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the personnel_id for the user
    await user.update({ personnel_id });

    res.status(200).json({
      message: "User's personnel_id updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      message: "Internal server error. Failed to update user.",
      error: error.message,
    });
  }
});

router.post("/api/sync-to-users", async (req, res) => {
  const { personnelId, personnelName } = req.body;

  try {
    // Step 1: Find personnel by ID
    const personnel = await Personnel.findOne({
      where: { personnel_id: personnelId },
    });
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found." });
    }

    // Step 2: Search for the LDAP user by full name
    let ldapUser;
    try {
      ldapUser = await ldapSearchByFullname(personnelName);
    } catch (error) {
      return res.status(404).json({
        message:
          "LDAP user not found for the given name. Please ensure the full name is correctly entered or add the personnel to the LDAP server.",
        details: error.message, // Optional for additional debugging information
      });
    }

    if (!ldapUser) {
      return res.status(404).json({
        message:
          "LDAP user not found for the given name. Please add the personnel to the LDAP server first.",
      });
    }

    // Ensure `ldapUser.uid` is a valid string
    const uid = Array.isArray(ldapUser.uid) ? ldapUser.uid[0] : ldapUser.uid;
    if (typeof uid !== "string") {
      return res.status(400).json({
        message: "Invalid LDAP UID format. Please check the LDAP server data.",
      });
    }

    // Step 3: Check if the user already exists in the users table
    const existingUser = await User.findOne({ where: { uid } });
    if (!existingUser) {
      return res.status(404).json({
        message:
          "User does not exist in the users table. Please add the user first.",
      });
    }

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists in the users table.",
      });
    }

    // Step 4: Save the user in the users table
    await User.create({
      uid,
      personnel_id: personnelId,
      username: uid, // Use `uid` as username
      password: ldapUser.userPassword || "", // Default to an empty string if undefined
      auth_type: "LDAP",
    });

    res.status(200).json({ message: "User synced successfully." });
  } catch (error) {
    console.error("Error syncing user:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

const ldapSearchByFullname = async (fullname) => {
  const client = createLdapClient();

  const bindClient = () =>
    new Promise((resolve, reject) => {
      client.bind(process.env.BIND_DN, process.env.BIND_PASSWORD, (err) => {
        if (err) {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error("LDAP unbind error:", unbindErr);
            }
          });
          reject(err);
        } else {
          resolve();
        }
      });
    });

  const searchLDAP = () =>
    new Promise((resolve, reject) => {
      const searchOptions = {
        filter: `(cn=${fullname})`, // Search by common name (fullname)
        scope: "sub",
        attributes: ["cn", "sn", "mail", "uid", "userPassword"], // Specify attributes to retrieve
      };

      const user = {};

      client.search(process.env.BASE_DN, searchOptions, (err, result) => {
        if (err) {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error("LDAP unbind error during search:", unbindErr);
            }
          });
          reject(err);
        }

        result.on("searchEntry", (entry) => {
          entry.attributes.forEach((attribute) => {
            if (attribute.type === "userPassword") {
              user[attribute.type] = attribute.vals[0];
            } else {
              user[attribute.type] = attribute.vals;
            }
          });
        });

        result.on("end", () => {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error("LDAP unbind error on end:", unbindErr);
            }
          });

          if (Object.keys(user).length > 0) {
            resolve(user);
          } else {
            reject(new Error("User not found in LDAP"));
          }
        });

        result.on("error", (err) => {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error("LDAP unbind error on error:", unbindErr);
            }
          });
          reject(err);
        });
      });
    });

  try {
    await bindClient();
    const user = await searchLDAP();
    return user;
  } catch (error) {
    console.error("Error during LDAP search:", error.message);
    throw new Error("LDAP search failed: " + error.message);
  }
};

// Change Password Endpoint
router.post("/api/users/change-password", (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  // Check if all required fields are provided
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Get the current password hash from the database
  const query = "SELECT password FROM users WHERE ID = ?";
  db.query(query, [userId], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Check if the user was found
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const storedPasswordHash = results[0].password;

    try {
      // Compare the provided current password with the stored hash
      const isMatch = await bcrypt.compare(currentPassword, storedPasswordHash);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      const updateQuery = "UPDATE users SET password = ? WHERE ID = ?";
      db.query(updateQuery, [newPasswordHash, userId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res.status(500).json({ message: "Error updating password" });
        }

        res.status(200).json({ message: "Password updated successfully" });
      });
    } catch (hashingError) {
      console.error("Error hashing the new password:", hashingError);
      res.status(500).json({ message: "Error processing password change" });
    }
  });
});

// Logged-In User Endpoint
router.get("/api/users/logged-in", async (req, res) => {
  const { username } = req.query; // Extract username from query parameters
  console.log("Received username in query1:", username); // Debug log

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  const query = `
  SELECT u.ID, u.username, u.avatar, u.auth_type, personnel_id, GROUP_CONCAT(a.name) AS availableApps
  FROM users u
  LEFT JOIN available_apps ua ON u.ID = ua.user_id
  LEFT JOIN apps a ON ua.app_id = a.id
  WHERE u.username = '${username}'
    GROUP BY u.ID`;

  db.query(query, async (err, results) => {
    if (err) {
      console.error("Error fetching logged-in user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      const user = results[0];

      // Check if user is authenticated with LDAP
      if (user.auth_type === "LDAP") {
        try {
          // Fetch user details from the LDAP API
          const ldapResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/ldap/user/${user.username}`
          );
          const ldapUser = ldapResponse.data;

          // Update user object with LDAP details
          user.name = `${ldapUser.cn}`;
          user.username = ldapUser.uid;
          user.email = ldapUser.mail; // Email from LDAP
        } catch (error) {
          console.error("Error connecting to LDAP server:", error);
          // Notify the user about LDAP server issues
          return res.status(500).json({
            message: "LDAP server is unreachable. Unable to fetch full name.",
          });
        }
      }

      // Process available applications
      user.availableApps = user.availableApps
        ? user.availableApps.split(",")
        : [];
      res.json(user);
    } else {
      res.status(404).json({ message: "No user is currently logged in" });
    }
  });
});

router.get("/api/nextcloud-login", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    // Request a login flow from Nextcloud
    const response = await axios.post(
      "https://cloud.pmdmc.net/index.php/login/v2",
      {}, // No payload required for this endpoint
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXTCLOUD_TOKEN}`, // Admin token or API key
          "Content-Type": "application/json",
        },
      }
    );

    // If the login flow is successful, return the polling endpoint and login URL
    if (response.data && response.data.poll && response.data.login) {
      res.json({
        nextcloudUrl: response.data.login, // Login URL for redirecting the user
        pollEndpoint: response.data.poll, // Polling endpoint for session confirmation
      });
    } else {
      res.status(500).json({
        message: "Unexpected response from Nextcloud login API",
      });
    }
  } catch (error) {
    console.error(
      "Error logging in to Nextcloud:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to log in to Nextcloud",
      details: error.response?.data || error.message,
    });
  }
});

// Check if the endpoint URL is correct and accessible from the frontend
router.put("/api/users/update-login-status", (req, res) => {
  console.log("Update login status endpoint hit"); // Debug log
  const { ID, isLoggedIn } = req.body;

  if (!ID) {
    console.error("Invalid User ID:", ID);
    return res.status(400).json({ message: "Invalid user ID", ID });
  }

  const query = "UPDATE users SET isLoggedIn = ? WHERE username = ?";
  db.query(query, [isLoggedIn ? 1 : 0, ID], (err, result) => {
    if (err) {
      console.error("Error updating login status:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      console.error("User not found for ID:", ID);
      return res.status(404).json({ message: "User not found1" });
    }

    console.log("Login status updated for user ID:", ID);
    res.status(200).json({ message: "User login status updated successfully" });
  });
});

// Get all users with their available apps and LDAP attributes
router.get("/api/users", async (req, res) => {
  const query = `
    SELECT u.ID, u.username, u.password,
    ug.id AS groupId,  u.avatar, ug.name as groupname, GROUP_CONCAT(a.name) AS availableApps 
    FROM users u 
    LEFT JOIN user_group_mappings ugm ON ugm.user_id = u.ID 
    LEFT JOIN user_groups ug ON ug.id = ugm.group_id 
    LEFT JOIN available_apps ua ON u.ID = ua.user_id 
    LEFT JOIN apps a ON ua.app_id = a.id 
    GROUP BY u.ID`;

  console.error("1");

  // Function to fetch users from LDAP
  const fetchLdapUsers = () => {
    return new Promise((resolve, reject) => {
      const client = createLdapClient();
      client.bind(process.env.BIND_DN, process.env.BIND_PASSWORD, (err) => {
        if (err) return reject("LDAP bind error");

        const searchOptions = {
          filter: "(objectClass=inetOrgPerson)",
          scope: "sub",
        };
        const users = [];

        client.search(process.env.BASE_DN, searchOptions, (err, result) => {
          if (err) return reject("LDAP search error");

          result.on("searchEntry", (entry) => {
            const ldapUser = {
              uid: entry.attributes.find((attr) => attr.type === "uid")
                ?.vals[0],
              givenName: entry.attributes.find(
                (attr) => attr.type === "givenName"
              )?.vals[0],
              sn: entry.attributes.find((attr) => attr.type === "sn")?.vals[0],
              mail: entry.attributes.find((attr) => attr.type === "mail")
                ?.vals[0],
            };
            users.push(ldapUser);
          });

          result.on("end", () => {
            client.unbind();
            resolve(users);
          });

          result.on("error", (err) => {
            client.unbind();
            reject(err);
          });
        });
      });
    });
  };
  console.error("2");
  // Fallback function to read from ldap_users.json
  const readLdapFromFile = () => {
    try {
      const filePath = path.join(__dirname, "../data/ldap_users.json");
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading LDAP data from file:", err);
      return [];
    }
  };
  try {
    // Fetch users from database
    const dbUsers = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          console.error("Error fetching users from database:", err);
          return reject("Database error");
        }
        // Format the database results
        const formattedResults = Array.isArray(results)
          ? results.map((user) => ({
              ...user,
              availableApps: user.availableApps
                ? user.availableApps.split(",")
                : [],
            }))
          : [];
        resolve(formattedResults);
      });
    });

    console.error("3");
    // Fetch users from LDAP
    //const ldapUsers = await fetchLdapUsers();

    let ldapUsers = [];
    try {
      // Attempt to fetch users from LDAP
      ldapUsers = await fetchLdapUsers();
    } catch (ldapError) {
      console.error(
        "LDAP fetch failed, falling back to local file:",
        ldapError
      );
      ldapUsers = readLdapFromFile(); // Use fallback data
    }

    console.error("4");

    // Combine the database users with LDAP attributes
    const combinedUsers = dbUsers.map((dbUser) => {
      // Find the matching LDAP user by username (or another unique field)
      const ldapUser = ldapUsers.find((lu) => lu.uid === dbUser.username);

      return {
        ...dbUser,
        givenName: ldapUser?.givenName || "N/A",
        sn: ldapUser?.sn || "N/A",
        mail: ldapUser?.mail || "N/A",
      };
    });

    console.error("5");
    // Send combined users data as JSON response
    res.json(combinedUsers);
  } catch (err) {
    console.error("Error in fetching users:", err);
    res.status(500).json({ message: "Error fetching users data" });
  }
});

// User login
// Login Endpoint
router.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  console.error("Usernmame: ", username);
  try {
    // Check if the user exists and retrieve hashed password
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }

      const user = results[0];
      const storedHash = user.password;

      let isMatch = false;

      // Determine hash type and verify accordingly
      if (storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$")) {
        // bcrypt hash
        isMatch = await bcrypt.compare(password, storedHash);
      } else if (storedHash.startsWith("{SSHA}")) {
        // SSHA hash
        isMatch = verifySSHA(password, storedHash);
      } else if (storedHash.startsWith("{MD5}")) {
        // MD5 hash
        isMatch = verifyMD5(password, storedHash);
      }

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }

      // If password matches, return success and user data
      console.log("User authenticated:", username);
      res.json({ success: true, user });
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add new user with selected apps
router.post("/api/users", (req, res) => {
  const { username, password, fullname, email, avatarUrl, availableApps } =
    req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const insertUserQuery =
    "INSERT INTO users (username, password, fullname, email, avatar) VALUES (?, ?, ?, ?, ?)";
  db.query(
    insertUserQuery,
    [username, password, fullname, email, avatarUrl],
    (err, results) => {
      if (err) {
        console.error("Error adding user:", err);
        return res
          .status(500)
          .json({ message: "Database error: " + err.message });
      }

      const userId = results.insertId;

      // Prepare app associations for available_apps table
      const userAppsQuery =
        "INSERT INTO available_apps (user_id, app_id) VALUES ?";
      const appValues = (availableApps || []).map((appId) => [userId, appId]);

      // Insert app associations only if there are apps selected
      if (appValues.length > 0) {
        db.query(userAppsQuery, [appValues], (err) => {
          if (err) {
            console.error("Error adding user apps:", err);
            return res
              .status(500)
              .json({ message: "Database error on apps: " + err.message });
          }
          res.status(201).json({
            message: "User added successfully with apps.",
            id: userId,
          });
        });
      } else {
        // If no apps are selected, respond with success without inserting into available_apps
        res.status(201).json({
          message: "User added successfully without apps.",
          id: userId,
        });
      }
    }
  );
});

// Update user details and assigned apps
router.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { username, avatar, availableApps } = req.body;

  // Update user details
  const updateUserQuery =
    "UPDATE users SET username = ?, avatar = ? WHERE ID = ?";
  db.query(updateUserQuery, [username, avatar, userId], (err) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ message: "Database update error" });
    }

    // Delete existing apps for the user
    const deleteAppsQuery = "DELETE FROM available_apps WHERE user_id = ?";
    db.query(deleteAppsQuery, [userId], (deleteErr) => {
      if (deleteErr) {
        console.error("Error deleting existing apps:", deleteErr);
        return res.status(500).json({ message: "Error updating apps" });
      }

      // Insert new available apps if any
      if (availableApps && availableApps.length > 0) {
        const insertAppsQuery =
          "INSERT INTO available_apps (user_id, app_id) VALUES ?";
        const values = availableApps.map((appId) => [userId, appId]);
        db.query(insertAppsQuery, [values], (insertErr) => {
          if (insertErr) {
            console.error("Error inserting updated apps:", insertErr);
            return res.status(500).json({ message: "Error updating apps" });
          }

          // Respond with success
          res.json({ message: "User and apps updated successfully" });
        });
      } else {
        // No apps to update, respond with success
        res.json({
          message: "User updated successfully with no apps assigned",
        });
      }
    });
  });
});

// Delete user and associated apps
router.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10); // Ensure userId is an integer
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  db.query("DELETE FROM available_apps WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("Error deleting user apps:", err);
      return res.status(500).json({ message: "Database error on apps" });
    }

    db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully." });
    });
  });
});

// User Logout Endpoint
router.post("/api/logout", (req, res) => {
  const { userId } = req.body;
  console.log("Received logout request for user:", userId); // Debug log

  if (!userId) {
    console.error("Logout failed: No userId provided");
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = "UPDATE users SET isLoggedIn = ? WHERE username = ?";

  db.query(query, [0, userId], (err, results) => {
    if (err) {
      console.error("Error updating user logout status:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.affectedRows === 0) {
      console.error("Logout failed: User not found", userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User logged out successfully:", userId);
    res.json({ message: "User logged out successfully" });
  });
});

const fs = require("fs");
// Update User Profile with Avatar Upload
router.put("/api/users_profile/:id", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get user ID and new avatar path
    const userId = req.params.id;
    const newAvatarPath = `/uploads/avatar/${req.file.filename}`;

    // Query to fetch the current avatar from the database
    const fetchQuery = "SELECT avatar FROM users WHERE ID = ?";
    db.query(fetchQuery, [userId], (fetchErr, results) => {
      if (fetchErr) {
        console.error(
          "Error fetching current avatar from the database:",
          fetchErr
        );
        return res.status(500).json({ error: "Database fetch failed" });
      }

      const currentAvatar = results[0]?.avatar; // Get the current avatar path

      // Update user's avatar in the database
      const updateQuery = "UPDATE users SET avatar = ? WHERE ID = ?";
      db.query(updateQuery, [newAvatarPath, userId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating avatar in the database:", updateErr);
          return res.status(500).json({ error: "Database update failed" });
        }

        // Delete the old avatar file if it exists and is not the default avatar
        if (currentAvatar && currentAvatar !== "/uploads/avatar/default.png") {
          const oldAvatarPath = path.join(__dirname, "..", currentAvatar);
          fs.unlink(oldAvatarPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old avatar:", unlinkErr);
            } else {
              console.log("Old avatar deleted successfully:", oldAvatarPath);
            }
          });
        }

        // Respond with the new avatar path
        return res.status(200).json({ avatar: newAvatarPath });
      });
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
