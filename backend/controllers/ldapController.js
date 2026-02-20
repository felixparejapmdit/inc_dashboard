// controllers/ldapController.js
require("dotenv").config();
const ldap = require("ldapjs");

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const moment = require("moment");
const { Attribute } = require("ldapjs"); // ✅ Ensure Attribute is imported

const Personnel = require("../models/personnels");
const LdapUser = require("../models/LDAP_Users");
const User = require("../models/User");
const { UAParser } = require("ua-parser-js");
const LoginAudit = require("../models/LoginAudit");

const { Op } = require("sequelize");

// Load environment variables
const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;

// Persistent Client Variable
let adminClient = null;
let bindingPromise = null;

// Helper: Get or Create Persistent LDAP Client
const getAdminClient = async () => {
  if (adminClient && adminClient.connected) {
    return adminClient;
  }

  if (bindingPromise) {
    return bindingPromise;
  }

  bindingPromise = new Promise((resolve, reject) => {
    console.log("🔵 Initializing new persistent LDAP client...");
    const client = ldap.createClient({
      url: LDAP_URL,
      reconnect: true, // Enable auto-reconnect
      timeout: 5000,
      connectTimeout: 5000,
    });

    client.on("error", (err) => {
      console.error("❌ LDAP Client Error:", err.message);
      if (adminClient === client) {
        adminClient = null;
        bindingPromise = null;
      }
    });

    client.on("connect", () => {
      console.log("✅ LDAP Client Connected");
    });

    client.bind(BIND_DN, BIND_PASSWORD, (err) => {
      if (err) {
        console.error("❌ LDAP Bind Error:", err.message);
        client.unbind(() => { }); // Attempt generic unbind
        adminClient = null;
        bindingPromise = null;
        reject(err);
      } else {
        console.log("✅ LDAP Bind Successful");
        adminClient = client;
        adminClient.connected = true; // Mark as connected
        resolve(client);
      }
    });
  });

  try {
    const client = await bindingPromise;
    return client;
  } catch (err) {
    bindingPromise = null; // Reset promise on failure
    throw err;
  }
};

// Kept for backward compatibility with other internal functions if they use it strictly locally
const createLdapClient = () => {
  const client = ldap.createClient({ url: LDAP_URL });
  client.on('error', (err) => console.error('❌ LDAP client error:', err));
  return client;
};

// ... (other functions remain unchanged)

// Refactored: Find LDAP user and log audit using Persistent Client
exports.findLdapUserAndAudit = async (username, userAgent) => {
  // console.log("Looking up LDAP user (internal):", username);

  try {
    const client = await getAdminClient();

    const searchOptions = {
      filter: `(uid=${username})`,
      scope: "sub",
      attributes: ["cn", "sn", "mail", "uid", "userPassword"],
    };

    return new Promise((resolve, reject) => {
      client.search(BASE_DN, searchOptions, (err, result) => {
        if (err) {
          console.error("❌ LDAP search error:", err.message);
          // Do not destroy the persistent client on search error, usually just a query error
          // specific retry logic could go here
          return reject(err);
        }

        const user = {};
        let found = false;

        result.on("searchEntry", (entry) => {
          found = true;
          entry.attributes.forEach((attribute) => {
            if (attribute.type === "userPassword") {
              user[attribute.type] = attribute.values[0];
            } else {
              user[attribute.type] = attribute.values;
            }
          });
        });

        result.on("end", async () => {
          if (found && Object.keys(user).length > 0) {
            // --- Login Audit Logic (Preserved) ---
            if (userAgent) {
              // Async audit logging detached from the main response flow to prevent delays
              logAudit(username, userAgent).catch(e => console.error("Audit Log Error:", e));
            }
            resolve(user);
          } else {
            console.warn(`⚠️ User not found in LDAP: ${username}`);
            reject(new Error("User not found"));
          }
        });

        result.on("error", (err) => {
          console.error("❌ LDAP Result Stream Error:", err.message);
          reject(err);
        });
      });
    });

  } catch (error) {
    console.error("Error during LDAP search wrapped:", error.message);
    throw new Error("LDAP search failed: " + error.message);
  }
};

// Helper for Audit Logging (Extracted for cleanliness)
async function logAudit(username, userAgent) {
  const parser = new UAParser(userAgent);
  const deviceData = parser.getResult();
  const device = deviceData.device?.type || "desktop";
  const os = `${deviceData.os?.name || "Unknown OS"} ${deviceData.os?.version || ""}`.trim();
  const browser = `${deviceData.browser?.name || "Unknown Browser"} ${deviceData.browser?.version || ""}`.trim();

  if (!os.startsWith("Unknown OS") && !browser.startsWith("Unknown Browser")) {
    const localUser = await User.findOne({ where: { username } });
    if (localUser) {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const existingAudit = await LoginAudit.findOne({
        where: {
          user_id: localUser.id,
          login_time: { [Op.between]: [startOfDay, endOfDay] }
        },
      });

      if (!existingAudit) {
        await LoginAudit.create({
          user_id: localUser.id,
          device,
          os,
          browser,
        });
        console.log(`✅ Login audit recorded for user_id ${localUser.id}`);
      }
    }
  }
}


// exports.changePassword = async (req, res) => {
//   const { username, oldPassword, newPassword } = req.body;

//   if (!username || !oldPassword || !newPassword) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   const client = ldap.createClient({ url: LDAP_URL });
//   const userDN = `uid=${username},cn=PMD-IT,dc=pmdmc,dc=net`;

//   // ✅ Step 1: Bind as the User to Verify Old Password
//   client.bind(userDN, oldPassword, (authErr) => {
//     if (authErr) {
//       client.unbind();
//       return res.status(401).json({ message: "Incorrect old password." });
//     }

//     // ✅ Step 2: Admin Bind to Change Password
//     client.bind(BIND_DN, BIND_PASSWORD, (adminErr) => {
//       if (adminErr) {
//         client.unbind();
//         return res
//           .status(500)
//           .json({ message: "LDAP admin bind failed.", error: adminErr });
//       }

//       // ✅ Step 3: Hash the New Password Correctly (MD5 + Base64)
//       const hashedNewPassword =
//         `{MD5}` + crypto.createHash("md5").update(newPassword).digest("base64");

//       // ✅ Step 4: Modify the Password (Fixed Format)
//       const change = new ldap.Change({
//         operation: "replace",
//         modification: new Attribute({
//           type: "userPassword",
//           values: [hashedNewPassword], // ✅ Correct format
//         }),
//       });

//       client.modify(userDN, change, (modErr) => {
//         if (modErr) {
//           client.unbind();
//           return res
//             .status(500)
//             .json({ message: "Failed to update password", error: modErr });
//         }

//         res.json({ message: "Password updated successfully." + username });

//         // ✅ Close connections properly
//         client.unbind();
//       });
//     });
//   });
// };

exports.changePassword = async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const client = ldap.createClient({ url: LDAP_URL });

  console.log(`🔍 Searching for user: ${username}`);

  // ✅ Step 1: Search for User DN Dynamically
  const opts = {
    filter: `(uid=${username})`,
    scope: "sub",
    attributes: ["dn", "uid", "cn", "sn", "mail"], // Request more attributes
  };

  client.bind(BIND_DN, BIND_PASSWORD, (bindErr) => {
    if (bindErr) {
      console.error("❌ LDAP Admin Bind Failed:", bindErr);
      return res
        .status(500)
        .json({ message: "LDAP Admin Bind Failed", error: bindErr });
    }

    client.search(BASE_DN, opts, (searchErr, searchRes) => {
      if (searchErr) {
        console.error("❌ LDAP Search Failed:", searchErr);
        client.unbind();
        return res
          .status(500)
          .json({ message: "LDAP Search Failed", error: searchErr });
      }

      let userDN = null;

      searchRes.on("searchEntry", (entry) => {
        console.log(
          "✅ LDAP Entry (Full JSON):",
          JSON.stringify(entry.pojo, null, 2)
        ); // 🔹 Use `.pojo`

        if (!entry.pojo || !entry.pojo.objectName) {
          console.error("❌ LDAP Entry is missing 'objectName' field.");
          return;
        }

        // ✅ Extract DN correctly
        userDN = entry.pojo.objectName;
        console.log("✅ Extracted User DN:", userDN);
      });

      searchRes.on("end", () => {
        if (!userDN) {
          console.error("❌ No valid LDAP entry found.");
          client.unbind();
          return res.status(404).json({ message: "User not found in LDAP." });
        }

        console.log("✅ Final User DN:", userDN);

        // ✅ Step 2: Bind as the User to Verify Old Password
        const userClient = ldap.createClient({ url: LDAP_URL });

        userClient.bind(userDN, oldPassword, (authErr) => {
          if (authErr) {
            console.error("❌ LDAP Bind Failed:", authErr);
            client.unbind();
            return res
              .status(401)
              .json({ message: "Incorrect old password.", error: authErr });
          }

          // ✅ Step 3: Admin Bind to Change Password
          userClient.bind(BIND_DN, BIND_PASSWORD, (adminErr) => {
            if (adminErr) {
              console.error("❌ LDAP Admin Bind Failed:", adminErr);
              userClient.unbind();
              return res
                .status(500)
                .json({ message: "LDAP Admin Bind Failed.", error: adminErr });
            }

            // ✅ Step 4: Hash the New Password (MD5 + Base64)
            const hashedNewPassword =
              `{MD5}` +
              crypto.createHash("md5").update(newPassword).digest("base64");

            // ✅ Step 5: Modify the Password
            const change = new ldap.Change({
              operation: "replace",
              modification: new Attribute({
                type: "userPassword",
                values: [hashedNewPassword], // ✅ Correct format
              }),
            });

            userClient.modify(userDN, change, (modErr) => {
              if (modErr) {
                console.error("❌ Failed to Update Password:", modErr);
                userClient.unbind();
                return res.status(500).json({
                  message: "Failed to update password",
                  error: modErr,
                });
              }

              console.log("✅ Password Updated Successfully for:", userDN);
              res.json({ message: "Password updated successfully." });

              // ✅ Close connections
              userClient.unbind();
            });
          });
        });
      });

      searchRes.on("error", (err) => {
        console.error("❌ LDAP Search Error:", err);
        client.unbind();
        return res
          .status(500)
          .json({ message: "LDAP search encountered an error", error: err });
      });
    });
  });
};

// Admin: Reset LDAP User Password without old password
exports.adminResetPassword = async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ message: "Username and new password are required." });
  }

  const client = ldap.createClient({ url: LDAP_URL });

  console.log(`🔍 Admin resetting password for user: ${username}`);

  // Step 1: Search for User DN Dynamically
  const opts = {
    filter: `(uid=${username})`,
    scope: "sub",
    attributes: ["dn"],
  };

  client.bind(BIND_DN, BIND_PASSWORD, (bindErr) => {
    if (bindErr) {
      console.error("❌ LDAP Admin Bind Failed:", bindErr);
      return res.status(500).json({ message: "LDAP Admin Bind Failed", error: bindErr });
    }

    client.search(BASE_DN, opts, (searchErr, searchRes) => {
      if (searchErr) {
        console.error("❌ LDAP Search Failed:", searchErr);
        client.unbind();
        return res.status(500).json({ message: "LDAP Search Failed", error: searchErr });
      }

      let userDN = null;

      searchRes.on("searchEntry", (entry) => {
        userDN = entry.pojo.objectName;
      });

      searchRes.on("end", async () => {
        if (!userDN) {
          client.unbind();
          return res.status(404).json({ message: "User not found in LDAP." });
        }

        // Step 2: Hash the New Password (MD5 + Base64)
        const hashedNewPassword = `{MD5}` + crypto.createHash("md5").update(newPassword).digest("base64");

        // Step 3: Modify the Password (Admin Level)
        const change = new ldap.Change({
          operation: "replace",
          modification: new Attribute({
            type: "userPassword",
            values: [hashedNewPassword],
          }),
        });

        client.modify(userDN, change, async (modErr) => {
          if (modErr) {
            console.error("❌ Failed to Update Password:", modErr);
            client.unbind();
            return res.status(500).json({ message: "Failed to reset password in LDAP", error: modErr });
          }

          console.log("✅ LDAP Password Reset Successfully for:", userDN);

          // Step 4: Sync with local users table if exists
          try {
            await User.update({ password: hashedNewPassword }, { where: { username } });
            console.log("✅ Local users table updated for:", username);
          } catch (dbErr) {
            console.warn("⚠️ LDAP updated, but local DB update failed:", dbErr.message);
          }

          client.unbind();
          res.json({ success: true, message: "Password reset successfully." });
        });
      });

      searchRes.on("error", (err) => {
        console.error("❌ LDAP Search Error:", err);
        client.unbind();
        res.status(500).json({ message: "LDAP search error", error: err });
      });
    });
  });
};

// Test LDAP connection
exports.testLdapConnection = (req, res) => {
  const client = createLdapClient();

  client.bind(BIND_DN, BIND_PASSWORD, (err) => {
    if (err) {
      console.error("LDAP connection failed:", err);
      return res
        .status(500)
        .json({ message: "LDAP connection failed", error: err });
    }
    console.log("Successfully connected to LDAP server");
    res.status(200).json({ message: "LDAP connection successful" });

    client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error("LDAP unbind error:", unbindErr);
      }
    });
  });
};

// Fetch users from JSON file
exports.getUsersFromJson = (req, res) => {
  const filePath = path.join(__dirname, "../data/ldap_users.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading LDAP data file:", err);
      return res
        .status(500)
        .json({ error: "Error reading LDAP data file", filePath });
    }
    const ldapData = JSON.parse(data);
    res.json(ldapData.LDAP_Users);
  });
};

// Fetch users and groups from LDAP
exports.getLdapUsersAndGroups = async (req, res) => {
  console.log("Fetching all users and groups from LDAP");

  const client = createLdapClient();

  // Helper function to bind to the LDAP server
  const bindClient = () =>
    new Promise((resolve, reject) => {
      client.bind(BIND_DN, BIND_PASSWORD, (err) => {
        if (err) {
          client.unbind();
          reject(err);
        } else {
          resolve();
        }
      });
    });

  // Helper function to fetch users
  const fetchUsers = () =>
    new Promise((resolve, reject) => {
      const searchOptions = {
        filter: "(objectClass=inetOrgPerson)",
        scope: "sub",
      };

      const users = [];
      client.search(BASE_DN, searchOptions, (err, result) => {
        if (err) {
          client.unbind();
          reject(err);
        }

        result.on("searchEntry", (entry) => {
          users.push(entry.attributes);
        });

        result.on("end", () => {
          resolve(users);
        });

        result.on("error", (err) => {
          reject(err);
        });
      });
    });

  // Helper function to fetch groups
  const fetchGroups = () =>
    new Promise((resolve, reject) => {
      const searchOptions = {
        filter: "(objectClass=posixGroup)",
        scope: "sub",
      };

      const groups = [];
      client.search(BASE_DN, searchOptions, (err, result) => {
        if (err) {
          client.unbind();
          reject(err);
        }

        result.on("searchEntry", (entry) => {
          const groupName =
            entry.attributes.find((attr) => attr.type === "cn")?.vals[0] ||
            "Unknown";
          const gidNumber = entry.attributes.find(
            (attr) => attr.type === "gidNumber"
          )?.vals[0];
          const memberUids =
            entry.attributes.find((attr) => attr.type === "memberUid")?.vals ||
            [];

          if (groupName && gidNumber) {
            groups.push({ groupName, gidNumber, memberUids });
          }
        });

        result.on("end", () => {
          resolve(groups);
        });

        result.on("error", (err) => {
          reject(err);
        });
      });
    });

  try {
    await bindClient(); // Bind to LDAP server
    const users = await fetchUsers();
    const groups = await fetchGroups();

    // Utility function to extract attribute values with improved handling
    const getAttributeValue = (attributes, type) => {
      if (Array.isArray(attributes)) {
        const attribute = attributes.find(
          (attr) => attr.type === type || attr.name === type
        );
        if (attribute) {
          return attribute.vals
            ? attribute.vals[0]
            : attribute.values
              ? attribute.values[0]
              : "N/A";
        }
      } else if (typeof attributes === "object" && attributes[type]) {
        return attributes[type];
      }
      return "N/A";
    };

    // Log fetched users and groups for debugging
    console.log("Fetched Users:", JSON.stringify(users, null, 2));
    console.log("Fetched Groups:", JSON.stringify(groups, null, 2));

    // Match each user to their respective group
    const usersWithGroups = users.map((user) => {
      const uid = getAttributeValue(user, "uid");
      const gidNumber = getAttributeValue(user, "gidNumber");

      // Find the group where this gidNumber or uid exists
      const userGroup = groups.find(
        (group) =>
          group.gidNumber === gidNumber || group.memberUids.includes(uid)
      );

      // Add the group name to the user
      return {
        givenName: getAttributeValue(user, "givenName"),
        sn: getAttributeValue(user, "sn"),
        uid,
        mail: getAttributeValue(user, "mail"),
        uidNumber: getAttributeValue(user, "uidNumber"),
        gidNumber,
        userPassword: getAttributeValue(user, "userPassword"),
        groupName: userGroup ? userGroup.groupName : "Unknown",
      };
    });

    res.json(usersWithGroups); // Respond with the mapped users and groups
  } catch (err) {
    console.error("LDAP error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Authenticate user using JSON data
exports.authenticateUserFromJson = (req, res) => {
  const username = req.params.username;
  const providedPassword = req.query.password;

  const filePath = path.join(__dirname, "../data/ldap_users.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading LDAP data file:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const ldapData = JSON.parse(data);
    const user = ldapData.LDAP_Users.find((user) => user.uid === username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = bcrypt.compareSync(
      providedPassword,
      user.userPassword
    );
    if (isPasswordValid) {
      res.json({
        uid: user.uid,
        cn: user.cn,
        mail: user.mail,
        gidNumber: user.gidNumber,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
};

// GET /api/login-audits/recent
exports.getRecentLoginAudits = async (req, res) => {
  try {
    const audits = await LoginAudit.findAll({
      order: [["login_time", "DESC"]],
      include: [
        {
          model: User,
          as: "user", // ✅ important
          attributes: ["id", "username", "personnel_id", "avatar"], // Add any user fields you need
          include: [
            {
              model: Personnel,
              as: "personnel",
              attributes: ["department_id", "section_id", "subsection_id", "designation_id"],
            },
          ],
        },
      ],
    });

    res.json(audits);
  } catch (error) {
    console.error("Failed to fetch recent login audits:", error);
    res.status(500).json({ error: "Failed to fetch recent login audits" });
  }
};


exports.getAllLoginAudits = async (req, res) => {
  try {
    const audits = await LoginAudit.findAll({
      order: [["login_time", "DESC"]], // Order by most recent first
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "personnel_id", "avatar"],
        },
      ],
      // Note: No WHERE clause, no LIMIT, fetches all records.
    });

    // Use the same success structure as getAllLoginUsers
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      success: true,
      total: audits.length,
      data: audits, // Send the array of audit objects
    });
  } catch (error) {
    console.error("Error fetching all login audits:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      success: false,
      message: "Error fetching all login audits",
      error: error.message,
    });
  }
};

exports.filterAudits = async (req, res) => {
  try {
    const { date, month, year, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    // --- Date Filtering ---
    if (date) {
      where.login_time = {
        [Op.between]: [moment(date).startOf("day").toDate(), moment(date).endOf("day").toDate()],
      };
    } else if (month && year) {
      where.login_time = {
        [Op.between]: [
          moment(`${year}-${month}-01`).startOf("month").toDate(),
          moment(`${year}-${month}-01`).endOf("month").toDate(),
        ],
      };
    } else if (year) {
      where.login_time = {
        [Op.between]: [
          moment(`${year}-01-01`).startOf("year").toDate(),
          moment(`${year}-12-31`).endOf("year").toDate(),
        ],
      };
    }

    // --- Query with total count ---
    const { count, rows } = await LoginAudit.findAndCountAll({
      where,
      include: [{ model: User, as: "user" }],
      order: [["login_time", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      audits: rows,
    });
  } catch (error) {
    console.error("Error filtering login audits:", error);
    res.status(500).json({
      message: "Error filtering login audits",
      error: error.message,
    });
  }
};

// GET /api/login-audits/filter
exports.getFilteredLoginAudits = async (req, res) => {
  try {
    const { page = 1, limit = 15, date, month, year } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.login_time = { [Op.between]: [start, end] };
    } else if (month && year) {
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.login_time = { [Op.between]: [start, end] };
    } else if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${parseInt(year) + 1}-01-01`);
      where.login_time = { [Op.between]: [start, end] };
    }

    const { count, rows } = await LoginAudit.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "personnel_id", "avatar"],
        },
      ],
      order: [["login_time", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      audits: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Failed to fetch filtered login audits:", error);
    res.status(500).json({ error: "Failed to fetch filtered login audits" });
  }
};

// GET /api/login-audits (New logic for the Audit Page)
exports.getAllLoginAudits = async (req, res) => {
  try {
    const audits = await LoginAudit.findAll({
      order: [["login_time", "DESC"]], // Order by most recent
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "personnel_id", "avatar"],
        },
      ],
      // NOTE: No LIMIT here, fetching all data for the management page
    });

    res.json(audits);
  } catch (error) {
    console.error("Failed to fetch all login audits:", error);
    res.status(500).json({ error: "Failed to fetch all login audits" });
  }
};

// ✅ New: get users who have NOT logged in today
exports.getUsersNotLoggedInToday = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get all users
    const allUsers = await User.findAll({
      attributes: ["id", "username", "personnel_id", "avatar"],
    });

    // Get users who logged in today
    const loggedInToday = await LoginAudit.findAll({
      where: {
        login_time: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      attributes: ["user_id"],
      group: ["user_id"],
    });

    const loggedInIds = loggedInToday.map((a) => a.user_id);

    // Filter users who haven't logged in today
    const missingUsers = allUsers.filter((u) => !loggedInIds.includes(u.id));

    res.json({ success: true, data: missingUsers });
  } catch (error) {
    console.error("Error getting users not logged in today:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users not logged in today",
    });
  }
};



// Login using PMD LDAP credentials by username
exports.getUserByUsername = async (req, res) => {
  const username = req.params.username;
  console.log("Received request for username:", username);

  try {
    const user = await exports.findLdapUserAndAudit(username, req.headers["user-agent"]);
    res.json(user);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "LDAP error", error: error.message });
  }
};

// Retrieve groups by common name (cn)
exports.getGroups = (req, res) => {
  const client = createLdapClient();

  client.bind(BIND_DN, BIND_PASSWORD, (err) => {
    if (err) {
      console.error("LDAP bind error:", err);
      return res.status(500).json({ error: "Failed to bind to LDAP server" });
    }

    const options = {
      filter:
        "(|(objectClass=posixGroup)(objectClass=groupOfNames)(objectClass=groupOfUniqueNames))", // Look for any group-related objectClass
      scope: "sub",
      attributes: ["cn", "gidNumber"], // Request the cn and gidNumber
    };

    const groups = [];
    client.search(process.env.GROUP_BASE_DN, options, (err, result) => {
      if (err) {
        console.error("LDAP search error:", err);
        client.unbind();
        return res.status(500).json({ error: "LDAP search error" });
      }

      result.on("searchEntry", (entry) => {
        if (entry.object) {
          console.log("Group entry found:", entry.object);
          groups.push({
            cn: entry.object.cn || "N/A",
            gidNumber: entry.object.gidNumber || "N/A",
          });
        }
      });

      result.on("end", (result) => {
        console.log("LDAP search completed with result status:", result.status);
        client.unbind();
        res.json(groups);
      });

      result.on("error", (err) => {
        console.error("LDAP search error:", err);
        client.unbind();
        res.status(500).json({ error: "LDAP search error" });
      });
    });
  });
};

exports.SyncLdapUser = async (req, res) => {
  const { personnelId } = req.body;

  try {
    // Fetch personnel details
    const personnel = await Personnel.findByPk(personnelId);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    // Fetch the corresponding LDAP user
    const ldapUser = await LdapUser.findOne({
      where: { cn: personnel.full_name }, // Assuming `cn` matches personnel's full name
    });
    if (!ldapUser) {
      return res.status(404).json({ message: "LDAP user not found" });
    }

    // Create an entry in the users table
    const user = await User.create({
      personnel_id: personnelId,
      uid: ldapUser.uidNumber,
      username: ldapUser.uid,
      auth_type: "LDAP",
      password: ldapUser.userPassword, // Hash this if necessary
    });

    res.status(201).json({ message: "User synced successfully", user });
  } catch (error) {
    console.error("Error syncing LDAP user:", error);
    res.status(500).json({ message: "Error syncing LDAP user", error });
  }
};