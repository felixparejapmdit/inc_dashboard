
// ✅ Import Redis client (DISABLED)
// const { client: redisClient, connectRedis } = require("../config/redisClient");

// Connect Redis before handling requests (DISABLED)
// connectRedis().catch((err) => console.error("Redis connection failed:", err));


const https = require("https");
const express = require("express");
const router = express.Router();
const db = require("../db");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Personnel = require("../models/personnels");
const PersonnelHistory = require("../models/PersonnelHistory");
const UserGroupMapping = require("../models/UserGroupMapping");
const Group = require("../models/Group");
const UserController = require("../controllers/userController");
const ldapController = require("../controllers/ldapController");
const { client: esClient, connectElasticsearch } = require("../config/elasticsearchClient");

const verifyToken = require("../middlewares/authMiddleware");


//const db1 = require("../config/database");
const axios = require("axios");

const agent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ This disables SSL validation - use only in development
});

//const ldap = require("ldapjs");
//const LDAP_URL = process.env.LDAP_URL;
// const BIND_DN = process.env.BIND_DN;
// const BIND_PASSWORD = process.env.BIND_PASSWORD;
// const BASE_DN = process.env.BASE_DN;

// API URLs for districts and local congregations

const DISTRICT_API_URL = `${process.env.REACT_APP_DISTRICT_API_URL}/api/districts`;
const LOCAL_CONGREGATION_API_URL = `${process.env.REACT_APP_LOCAL_CONGREGATION_API_URL}/api/all-congregations`;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache for API data
let externalApiCache = {
  districts: { data: [], timestamp: 0 },
  locals: { data: [], timestamp: 0 }
};

// Utility to create an LDAP client
const createLdapClient = () => {
  const ldap = require("ldapjs");

  const client = ldap.createClient({
    url: process.env.LDAP_URL,
    timeout: 5000, // 5 seconds timeout for operations
    connectTimeout: 5000, // 5 seconds for connection timeout
    reconnect: true, // Enable reconnect
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
// function verifyMD5(password, hash) {
//   const derivedHash = `{MD5}${crypto
//     .createHash("md5")
//     .update(password)
//     .digest("base64")}`;
//   return derivedHash === hash;
// }

function verifyMD5(password, storedHash) {
  if (!storedHash.startsWith("{MD5}")) return false;

  const base64Hash = storedHash.slice(5); // Remove "{MD5}"
  const decodedStored = Buffer.from(base64Hash, "base64"); // Get raw digest

  const md5 = crypto.createHash("md5");
  md5.update(password);
  const digest = md5.digest(); // Raw MD5 digest

  return digest.equals(decodedStored); // Byte-by-byte comparison
}

router.put("/api/users/:userId/assign-group", UserController.assignGroup);

router.get("/api/users_access/:username", UserController.getUserByUsername);

router.get("/api/login_users", verifyToken, UserController.getAllLoginUsers);

//router.get("/api/login-audits/filter", ldapController.getFilteredLoginAudits);
router.get(
  "/api/login-audits",
  verifyToken,
  ldapController.getAllLoginAudits
);

router.get("/api/login-audits/filter", verifyToken, ldapController.filterAudits);

// Update user's progress stage
router.put("/api/users/update-progress", verifyToken, UserController.updateProgress);

// Route to trigger the migration of LDAP users
router.post(
  "/api/migrateLdapToPmdLoginUsers",
  UserController.migrateLdapToPmdLoginUsers
);

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
      user.avatar = `/uploads/avatar/${req.file.filename}`;
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
  const { personnelId, personnelName, groupId } = req.body;

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

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists in the users table.",
      });
    }

    // Step 4: Save the user in the users table
    const newUser = await User.create({
      uid,
      personnel_id: personnelId,
      username: uid, // Use `uid` as username
      password: ldapUser.userPassword || "", // Default to an empty string if undefined
      auth_type: "LDAP",
    });

    // Step 5: Assign Group if selected
    if (groupId) {
      await UserGroupMapping.create({
        user_id: newUser.id,
        group_id: groupId
      });
    }

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
router.get("/api/users/logged-in", verifyToken, async (req, res) => {
  const { username } = req.query; // Extract username from query parameters
  console.log("Received username in query1:", username); // Debug log

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  const cacheKey = `logged_in_user_${username}`;

  try {
    // 1️⃣ CACHE REMOVED (DISABLED)
    // const cachedUser = await redisClient.get(cacheKey);
    // if (cachedUser) {
    //   console.log(`📦 Serving logged-in user ${username} from Redis cache`);
    //   return res.status(200).json(JSON.parse(cachedUser));
    // }

    const query = `
  SELECT u.ID, u.username, u.avatar, u.auth_type, u.personnel_id, GROUP_CONCAT(a.name) AS availableApps, p.enrollment_progress, p.gender
  FROM users u
  LEFT JOIN available_apps ua ON u.ID = ua.user_id
  LEFT JOIN personnels p ON p.personnel_id = u.personnel_id
  LEFT JOIN apps a ON ua.app_id = a.id
  WHERE u.username = ?
    GROUP BY u.ID`;

    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Error fetching logged-in user:", err);
        return res.status(500).json({ message: "Database error", error: err.message, code: err.code });
      }

      if (results.length > 0) {
        const user = results[0];

        // Check if user is authenticated with LDAP
        if (user.auth_type === "LDAP") {
          try {
            // Fetch user details from LDAP directly (avoiding HTTP loopback)
            const ldapUser = await ldapController.findLdapUserAndAudit(user.username, req.headers["user-agent"]);

            // Update user object with LDAP details
            const getVal = (val) => Array.isArray(val) ? val[0] : val;

            user.name = getVal(ldapUser.cn);
            user.username = getVal(ldapUser.uid);
            user.email = getVal(ldapUser.mail);

          } catch (error) {
            console.error("Error fetching LDAP data:", error);
            // Notify the user about LDAP server issues
            return res.status(500).json({
              message: "LDAP server issue. Unable to fetch full name.",
              error: error.message
            });
          }
        }

        // Process available applications
        user.availableApps = user.availableApps
          ? user.availableApps.split(",")
          : [];

        // 3️⃣ Cache Removed (DISABLED)
        // await redisClient.set(cacheKey, JSON.stringify(user), { EX: 300 });
        // console.log(`✅ Logged-in user ${username} cached in Redis`);

        res.json(user);
      } else {
        res.status(404).json({ message: "No user is currently logged in" });
      }
    });
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/api/nextcloud-login", verifyToken, async (req, res) => {
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

    // 🗑️ INVALIDATE REDIS CACHE (DISABLED)
    // const cacheKey = `user_${ID}`;
    // redisClient.del(cacheKey).then(() => {
    //   console.log(`🗑️ Invalidated Redis cache for: ${cacheKey}`);
    // }).catch(err => console.error("Redis delete error:", err));

    // Also invalidate logged_in_user cache just in case (DISABLED)
    // const loggedInCacheKey = `logged_in_user_${ID}`;
    // redisClient.del(loggedInCacheKey).catch(err => console.error("Redis delete error:", err));


    res.status(200).json({ message: "User login status updated successfully" });
  });
});

// Function to fetch external API data with caching
const fetchApiDataCached = async (url, type) => {
  const now = Date.now();
  if (externalApiCache[type].data.length > 0 && (now - externalApiCache[type].timestamp < CACHE_DURATION)) {
    return externalApiCache[type].data;
  }

  try {
    const response = await axios.get(url, { timeout: 3000 });
    const data = response.data || [];
    externalApiCache[type] = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.message);
    return externalApiCache[type].data; // Return stale data on error if possible
  }
};

// Get all users with their available apps and LDAP attributes
router.get("/api/users", verifyToken, async (req, res) => {
  console.log("🧠 Fetching fresh user data...");

  // Function to fetch users from LDAP
  const fetchLdapUsers = () => {
    return new Promise((resolve, reject) => {
      const client = createLdapClient();
      client.bind(process.env.BIND_DN, process.env.BIND_PASSWORD, (err) => {
        if (err) {
          console.error("LDAP bind error:", err);
          return resolve([]); // Resolve with empty instead of reject to allow DB data to show
        }

        const searchOptions = {
          filter: "(objectClass=inetOrgPerson)",
          scope: "sub",
          attributes: ["uid", "givenName", "sn", "mail"]
        };
        const users = [];

        client.search(process.env.BASE_DN, searchOptions, (err, result) => {
          if (err) {
            console.error("LDAP search error:", err);
            client.unbind();
            return resolve([]);
          }

          result.on("searchEntry", (entry) => {
            const attrs = {};
            entry.attributes.forEach(attr => {
              attrs[attr.type] = attr.vals[0];
            });
            users.push(attrs);
          });

          result.on("end", () => {
            client.unbind();
            resolve(users);
          });

          result.on("error", (err) => {
            console.error("LDAP search result error:", err);
            client.unbind();
            resolve(users);
          });
        });
      });
    });
  };

  // Fallback function to read from ldap_users.json
  const readLdapFromFile = () => {
    try {
      const filePath = path.join(__dirname, "../data/ldap_users.json");
      if (!fs.existsSync(filePath)) return [];
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : (parsed.LDAP_Users || []);
    } catch (err) {
      console.error("Error reading LDAP data from file:", err);
      return [];
    }
  };

  // SQL Query for DB users
  const sqlQuery = `
  SELECT 
    u.ID, u.personnel_id, u.username, u.password, MAX(ug.id) AS groupId, u.avatar, 
    MAX(ug.name) as groupname, GROUP_CONCAT(a.name) AS availableApps,
    p.givenname AS personnel_givenname, p.middlename AS personnel_middlename,
    p.surname_husband AS personnel_surname_husband, p.surname_maiden AS personnel_surname_maiden,
    p.suffix AS personnel_suffix, p.nickname AS personnel_nickname,
    dreg.name As personnel_registered_district_id, lc.name AS personnel_registered_local_congregation,
    p.date_of_birth AS personnel_date_of_birth, p.place_of_birth AS personnel_place_of_birth,
    p.datejoined AS personnel_datejoined, p.gender AS personnel_gender,
    p.civil_status AS personnel_civil_status, p.wedding_anniversary AS personnel_wedding_anniversary,
    p.email_address AS personnel_email, p.bloodtype AS personnel_bloodtype,
    p.local_congregation AS personnel_local_congregation, p.personnel_type AS personnel_type,
    p.district_assignment_id AS personnel_district_assignment_id,
    p.local_congregation_assignment AS personnel_local_congregation_assignment,
    p.assigned_number AS personnel_assigned_number, p.panunumpa_date AS personnel_panunumpa_date,
    p.ordination_date AS personnel_ordination_date, d.name AS personnel_department_name,
    s.name AS personnel_section_name, s.id AS personnel_section_id,
    ss.name AS personnel_subsection_name, ss.id AS personnel_subsection_id,
    dg.name AS personnel_designation_name, dt.name AS personnel_district_name,
    l.name AS personnel_language_name, u.id as user_id, p.citizenship,
    p.designation_id, p.language_id, edu.educational_levels AS personnel_educational_level,
    addr.address_types AS INC_Housing
  FROM users u 
  LEFT JOIN user_group_mappings ugm ON ugm.user_id = u.ID 
  LEFT JOIN user_groups ug ON ug.id = ugm.group_id 
  LEFT JOIN available_apps ua ON u.ID = ua.user_id 
  LEFT JOIN apps a ON ua.app_id = a.id 
  LEFT JOIN personnels p ON u.personnel_id = p.personnel_id
  LEFT JOIN departments d ON p.department_id = d.id
  LEFT JOIN sections s ON p.section_id = s.id
  LEFT JOIN subsections ss ON p.subsection_id = ss.id
  LEFT JOIN designations dg ON p.designation_id = dg.id
  LEFT JOIN districts dreg ON p.registered_district_id = dreg.id
  LEFT JOIN local_congregation lc ON p.registered_local_congregation = lc.id
  LEFT JOIN districts dt ON p.district_assignment_id = dt.id
  LEFT JOIN languages l ON p.language_id = l.id
  LEFT JOIN (
      SELECT personnel_id, GROUP_CONCAT(level SEPARATOR '; ') AS educational_levels
      FROM educational_background GROUP BY personnel_id
  ) AS edu ON edu.personnel_id = p.personnel_id
  LEFT JOIN (
      SELECT pa.personnel_id, pa.name AS address_types
      FROM personnel_address pa
      JOIN (
          SELECT personnel_id, MAX(id) AS max_id FROM personnel_address
          WHERE address_type = 'INC Housing' GROUP BY personnel_id
      ) latest ON pa.personnel_id = latest.personnel_id AND pa.id = latest.max_id
  ) AS addr ON addr.personnel_id = u.personnel_id
  WHERE u.uid IS NOT NULL AND (p.deleted_at IS NULL OR u.personnel_id IS NULL)
  GROUP BY 
    u.ID, u.personnel_id, u.username, u.password, u.avatar, 
    p.givenname, p.middlename, p.surname_husband, p.surname_maiden, p.suffix, p.nickname, 
    p.registered_district_id, p.registered_local_congregation, p.date_of_birth, 
    p.place_of_birth, p.datejoined, p.gender, p.civil_status, p.wedding_anniversary, 
    p.email_address, p.bloodtype, p.local_congregation, p.personnel_type, 
    p.local_congregation_assignment, p.assigned_number, p.panunumpa_date, p.ordination_date, 
    d.name, s.name, s.id, ss.name, ss.id, dg.name, dt.name, l.name, 
    u.id, p.citizenship, p.designation_id, p.language_id;
  `;

  try {
    // 🚀 Parallel Execution of all high-latency operations
    const [districts, localCongregations, dbResults, ldapUsersRaw] = await Promise.all([
      fetchApiDataCached(DISTRICT_API_URL, 'districts'),
      fetchApiDataCached(LOCAL_CONGREGATION_API_URL, 'locals'),
      new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, results) => (err ? reject(err) : resolve(results)));
      }),
      fetchLdapUsers().catch(() => readLdapFromFile())
    ]);

    // Optimize lookups with Maps
    const districtMap = new Map(districts.map(d => [d.id, d.name]));
    const localMap = new Map(localCongregations.map(lc => [lc.id, lc.name]));
    const ldapMap = new Map(ldapUsersRaw.map(u => [u.uid, u]));

    // Format and combine data
    const combinedUsers = (dbResults || []).map((user) => {
      const ldapUser = ldapMap.get(user.username);
      return {
        ...user,
        availableApps: user.availableApps ? user.availableApps.split(",") : [],
        personnel_district_assignment_name: districtMap.get(user.personnel_district_assignment_id) || "N/A",
        personnel_local_congregation_assignment_name: localMap.get(user.personnel_local_congregation_assignment) || "N/A",
        givenName: ldapUser?.givenName || "N/A",
        sn: ldapUser?.sn || "N/A",
        mail: ldapUser?.mail || "N/A",
      };
    });

    res.json(combinedUsers);
  } catch (err) {
    console.error("Error in fetching users:", err);
    res.status(500).json({
      message: "Error fetching users data",
      error: err.message,
      stack: err.stack
    });
  }
});

// User login
// Login Endpoint

const jwt = require("jsonwebtoken");
require("dotenv").config(); // make sure this is called at the top of your entry file (e.g., index.js or server.js)


router.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  console.error("Username: ", password);
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
          .json({ success: false, message: "Invalid username or password111" + storedHash });
      }

      // ✅ Generate JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );

      // If password matches, return success and user data
      console.log("User authenticated:", username);
      // ✅ Return token and user info
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          // optionally return other fields like email, role, etc.
        },
      });
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
  const { username, avatar, availableApps, fullname, email } = req.body;

  console.log(`[PUT] Updating user ${userId}. Payload:`, { username, fullname, email, appsCount: availableApps?.length });

  // Update user details
  // Note: 'fullname' and 'email' columns do not exist in the users table, so they are omitted here.
  const updateUserQuery =
    "UPDATE users SET username = ?, avatar = ? WHERE ID = ?";
  db.query(updateUserQuery, [username, avatar, userId], (err) => {
    if (err) {
      console.error("Error updating user details:", err);
      return res.status(500).json({ message: "Database update error" });
    }

    // Delete existing apps for the user
    const deleteAppsQuery = "DELETE FROM available_apps WHERE user_id = ?";
    db.query(deleteAppsQuery, [userId], (deleteErr) => {
      if (deleteErr) {
        console.error("Error deleting existing apps:", deleteErr);
        return res.status(500).json({ message: "Error updating apps (delete phase)" });
      }

      // Insert new available apps if any
      if (availableApps && Array.isArray(availableApps) && availableApps.length > 0) {
        const insertAppsQuery =
          "INSERT INTO available_apps (user_id, app_id) VALUES ?";
        const values = availableApps.map((appId) => [userId, appId]);

        db.query(insertAppsQuery, [values], (insertErr) => {
          if (insertErr) {
            console.error("Error inserting updated apps:", insertErr);
            return res.status(500).json({ message: "Error updating apps (insert phase)" });
          }

          // Respond with success
          console.log(`[PUT] User ${userId} updated successfully with ${availableApps.length} apps.`);
          res.json({ message: "User and apps updated successfully" });
        });
      } else {
        // No apps to update, respond with success
        console.log(`[PUT] User ${userId} updated successfully (no apps assigned).`);
        res.json({
          message: "User updated successfully with no apps assigned",
        });
      }
    });
  });
});

const moment = require("moment"); // Or use new Date() if you don't want to install moment

// Delete user and associated apps
router.delete("/api/users/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const user = await User.findByPk(id);

    if (user && !user.personnel_id) {
      // It's an LDAP Only user, delete from users table
      await db.query("DELETE FROM available_apps WHERE user_id = ?", [id]);
      await user.destroy();
      return res.status(200).json({ message: "LDAP-only user deleted successfully." });
    }

    if (user && user.personnel_id) {
      const personnelId = user.personnel_id;

      // Delete apps associations
      await db.query("DELETE FROM available_apps WHERE user_id = ?", [id]);

      const deletedAt = moment().format("YYYY-MM-DD HH:mm:ss");

      // Soft delete personnel
      await db.query("UPDATE personnels SET deleted_at = ? WHERE personnel_id = ?", [deletedAt, personnelId]);

      // Log history
      await PersonnelHistory.create({
        personnel_id: personnelId,
        action: "Out",
        reason: "User deleted from User Management",
        performed_by: req.user ? req.user.username : "System"
      });

      return res.status(200).json({ message: "Personnel soft-deleted successfully." });
    }

    return res.status(404).json({ message: "Record not found" });
  } catch (error) {
    console.error("Error in delete route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
      return res.status(200).json({ message: "No file uploaded. Proceeding without avatar update." });
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


// ==========================================
// Elasticsearch Integration
// ==========================================

const syncSqlQuery = `
  SELECT 
    u.ID, u.personnel_id, u.username, u.password, MAX(ug.id) AS groupId, u.avatar, 
    MAX(ug.name) as groupname, GROUP_CONCAT(a.name) AS availableApps,
    p.givenname AS personnel_givenname, p.middlename AS personnel_middlename,
    p.surname_husband AS personnel_surname_husband, p.surname_maiden AS personnel_surname_maiden,
    p.suffix AS personnel_suffix, p.nickname AS personnel_nickname,
    dreg.name As personnel_registered_district_id, lc.name AS personnel_registered_local_congregation,
    p.date_of_birth AS personnel_date_of_birth, p.place_of_birth AS personnel_place_of_birth,
    p.datejoined AS personnel_datejoined, p.gender AS personnel_gender,
    p.civil_status AS personnel_civil_status, p.wedding_anniversary AS personnel_wedding_anniversary,
    p.email_address AS personnel_email, p.bloodtype AS personnel_bloodtype,
    p.local_congregation AS personnel_local_congregation, p.personnel_type AS personnel_type,
    p.district_assignment_id AS personnel_district_assignment_id,
    p.local_congregation_assignment AS personnel_local_congregation_assignment,
    p.assigned_number AS personnel_assigned_number, p.panunumpa_date AS personnel_panunumpa_date,
    p.ordination_date AS personnel_ordination_date, d.name AS personnel_department_name,
    s.name AS personnel_section_name, s.id AS personnel_section_id,
    ss.name AS personnel_subsection_name, ss.id AS personnel_subsection_id,
    dg.name AS personnel_designation_name, dt.name AS personnel_district_name,
    l.name AS personnel_language_name, u.id as user_id, p.citizenship,
    p.designation_id, p.language_id, edu.educational_levels AS personnel_educational_level,
    addr.address_types AS INC_Housing
  FROM users u 
  LEFT JOIN user_group_mappings ugm ON ugm.user_id = u.ID 
  LEFT JOIN user_groups ug ON ug.id = ugm.group_id 
  LEFT JOIN available_apps ua ON u.ID = ua.user_id 
  LEFT JOIN apps a ON ua.app_id = a.id 
  LEFT JOIN personnels p ON u.personnel_id = p.personnel_id
  LEFT JOIN departments d ON p.department_id = d.id
  LEFT JOIN sections s ON p.section_id = s.id
  LEFT JOIN subsections ss ON p.subsection_id = ss.id
  LEFT JOIN designations dg ON p.designation_id = dg.id
  LEFT JOIN districts dreg ON p.registered_district_id = dreg.id
  LEFT JOIN local_congregation lc ON p.registered_local_congregation = lc.id
  LEFT JOIN districts dt ON p.district_assignment_id = dt.id
  LEFT JOIN languages l ON p.language_id = l.id
  LEFT JOIN (
      SELECT personnel_id, GROUP_CONCAT(level SEPARATOR '; ') AS educational_levels
      FROM educational_background GROUP BY personnel_id
  ) AS edu ON edu.personnel_id = p.personnel_id
  LEFT JOIN (
      SELECT personnel_id, pa.name AS address_types
      FROM personnel_address pa
      JOIN (
          SELECT personnel_id, MAX(id) AS max_id FROM personnel_address
          WHERE address_type = 'INC Housing' GROUP BY personnel_id
      ) latest ON pa.personnel_id = latest.personnel_id AND pa.id = latest.max_id
  ) AS addr ON addr.personnel_id = u.personnel_id
  WHERE u.uid IS NOT NULL AND (p.deleted_at IS NULL OR u.personnel_id IS NULL)
  GROUP BY 
    u.ID, u.personnel_id, u.username, u.password, u.avatar, 
    p.givenname, p.middlename, p.surname_husband, p.surname_maiden, p.suffix, p.nickname, 
    p.registered_district_id, p.registered_local_congregation, p.date_of_birth, 
    p.place_of_birth, p.datejoined, p.gender, p.civil_status, p.wedding_anniversary, 
    p.email_address, p.bloodtype, p.local_congregation, p.personnel_type, 
    p.district_assignment_id, p.local_congregation_assignment, p.assigned_number, 
    p.panunumpa_date, p.ordination_date, d.name, s.name, s.id, ss.name, ss.id, 
    dg.name, dt.name, l.name, u.id, p.citizenship, p.designation_id, p.language_id,
    dreg.name, lc.name, edu.educational_levels, addr.address_types;

`;

// Sync Users to Elasticsearch
router.post("/api/users/sync-es", verifyToken, async (req, res) => {
  const esNode = process.env.ELASTICSEARCH_NODE || 'http://inc_elasticsearch:9200';
  console.log("🔄 Starting Elasticsearch Sync on node:", esNode);

  // Check ES connection first
  try {
    const health = await esClient.cluster.health();
    console.log("🟢 ES Health Status:", health.status);
  } catch (esErr) {
    console.error("❌ ES Connection Check Failed:", esErr.message);
    return res.status(503).json({
      message: "Elasticsearch service is unavailable",
      error: esErr.message,
      node: process.env.ELASTICSEARCH_NODE || 'http://inc_elasticsearch:9200'
    });
  }

  try {
    // 1. Fetch Data from DB
    const users = await new Promise((resolve, reject) => {
      db.query(syncSqlQuery, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length === 0) {
      return res.status(200).json({ message: "No users to sync." });
    }

    // 2. Transform Data
    const dataset = users.map(user => {
      const fullname = `${user.personnel_givenname || ''} ${user.personnel_surname_husband || ''}`.trim() || user.username;
      return {
        id: user.ID,
        username: user.username,
        fullname: fullname,
        email: user.personnel_email,
        personnel_givenname: user.personnel_givenname,
        personnel_surname_husband: user.personnel_surname_husband,
        personnel_district_name: user.personnel_district_name,
        personnel_local_congregation: user.personnel_registered_local_congregation,
        personnel_type: user.personnel_type,
        availableApps: user.availableApps ? user.availableApps.split(",") : [],
        ...user // Include all other fields for flexibility
      };
    });

    // 3. Bulk Index
    const body = dataset.flatMap(doc => [
      { index: { _index: 'users', _id: doc.id } },
      doc
    ]);

    const { body: bulkResponse } = await esClient.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      const erroredDocuments = [];
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1]
          });
        }
      });
      console.error("❌ Stats Sync Errors:", erroredDocuments);
      return res.status(500).json({ message: "Sync finished with errors", errors: erroredDocuments });
    }

    const count = await esClient.count({ index: 'users' });
    console.log(`✅ Synced ${dataset.length} users. Total in ES: ${count.body.count}`);

    res.json({ message: `Successfully synced ${dataset.length} users to Elasticsearch.` });

  } catch (error) {
    console.error("❌ Sync Error:", error);
    res.status(500).json({
      message: "Error syncing to Elasticsearch",
      error: error.message,
      stack: error.stack
    });
  }
});

// Search Users via Elasticsearch
router.get("/api/users/search", verifyToken, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Query parameter 'q' is required." });
  }

  try {
    const { body } = await esClient.search({
      index: 'users',
      body: {
        query: {
          multi_match: {
            query: q,
            fields: [
              'username^3',
              'fullname^2',
              'personnel_givenname',
              'personnel_surname_husband',
              'personnel_district_name',
              'personnel_local_congregation',
              'personnel_email'
            ],
            fuzziness: 'AUTO'
          }
        }
      }
    });

    const hits = body.hits.hits.map(hit => hit._source);
    res.json(hits);

  } catch (error) {
    console.error("❌ Search Error:", error);
    // Fallback? Or just error.
    res.status(500).json({ message: "Search failed", error: error.message });
  }
});

module.exports = router;
