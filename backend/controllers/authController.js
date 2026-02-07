const ldap = require("ldapjs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios"); // Added axios for API requests
const User = require("../models/User"); // Your local user model
const LDAP_Users = require("../models/LDAP_Users"); // Import LDAP_Users model
const Personnel = require("../models/personnels"); // Import Personnel model
const UserGroupMapping = require("../models/UserGroupMapping"); // Import UserGroupMapping model
require("dotenv").config();
const { generateToken } = require("../utils/jwt"); // Import the generateToken function

// ✅ Build API_URL dynamically based on HTTPS flag in .env
// ✅ Build API_URL dynamically based on HTTPS flag in .env
const rawHost = process.env.REACT_APP_API_HOST || process.env.REACT_APP_API_URL;
let API_URL;

if (rawHost.startsWith("http://") || rawHost.startsWith("https://")) {
  API_URL = rawHost;
} else {
  const useHttps = process.env.HTTPS === "true";
  const protocol = useHttps ? "https" : "http";
  API_URL = `${protocol}://${rawHost}`;
}

// ✅ Load environment variables
const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";


//const API_URL = process.env.REACT_APP_API_URL; // Backend API URL
// ✅ Generate JWT Token
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user.id, username: user.username, groupId: user.groupId },
//     JWT_SECRET,
//     { expiresIn: JWT_EXPIRES_IN }
//   );
// };

// ✅ LDAP Authentication Function
// ✅ LDAP Authentication Function
const authenticateLDAP = (username, password) => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: LDAP_URL });

    client.on("error", (err) => {
      console.error("❌ LDAP Client Error:", err);
    });

    console.log(`🔍 Searching for LDAP user: ${username}`);

    const searchOptions = {
      filter: `(uid=${username})`,
      scope: "sub",
      // attributes: ["cn"], // ❌ Previous restriction caused missing GID
      attributes: ["cn", "uid", "gidNumber", "uidNumber", "homeDirectory", "sn", "givenName", "mail", "userPassword"], // ✅ Fetch all needed attributes
    };

    client.bind(BIND_DN, BIND_PASSWORD, (err) => {
      if (err) {
        console.error("❌ LDAP admin bind failed:", err);
        client.unbind();
        return reject("LDAP admin bind failed.");
      }

      client.search(BASE_DN, searchOptions, (searchErr, res) => {
        if (searchErr) {
          console.error("❌ LDAP search error:", searchErr);
          client.unbind();
          return reject("LDAP search error.");
        }

        let userDN = null;
        let fullName = username;
        let rawCn = null;
        let gidNumber = null;
        let uidNumber = null;
        let homeDirectory = null;

        res.on("searchEntry", (entry) => {
          console.log(
            "✅ Found LDAP Entry:",
            JSON.stringify(entry.pojo, null, 2)
          );

          // ✅ Extract the correct DN from `entry.pojo`
          userDN = entry.pojo.objectName;

          // ✅ Extract fullName safely from attributes
          if (entry.attributes) {
            const cnAttr = entry.attributes.find(a => a.type === "cn" || a.name === "cn");
            if (cnAttr) {
              fullName = Array.isArray(cnAttr.vals) ? cnAttr.vals[0] : (cnAttr.values ? cnAttr.values[0] : cnAttr.vals);
              rawCn = fullName; // Store raw CN
            }
            // Helper to get attribute val
            const getAttr = (name) => {
              const attr = entry.attributes.find(a => a.type === name || a.name === name);
              return attr ? (Array.isArray(attr.vals) ? attr.vals[0] : (attr.values ? attr.values[0] : attr.vals)) : null;
            };

            gidNumber = getAttr("gidNumber");
            uidNumber = getAttr("uidNumber");
            homeDirectory = getAttr("homeDirectory");
          }

          console.log("✅ Extracted User DN:", userDN);
          console.log("✅ Extracted Full Name:", fullName);
        });

        res.on("end", () => {
          if (!userDN) {
            console.error("❌ User not found in LDAP.");
            client.unbind();
            return reject("User not found in LDAP.");
          }

          console.log(`✅ Attempting bind as user: ${userDN}`);

          client.bind(userDN, password, (authErr) => {
            client.unbind();
            if (authErr) {
              console.error("❌ Invalid LDAP credentials:", authErr);
              return reject("Invalid LDAP credentials.");
            }
            console.log("✅ LDAP Authentication successful for:", userDN);
            resolve({ userDN, username, fullName, cn: rawCn, gidNumber, uidNumber, homeDirectory });
          });
        });

        res.on("error", (err) => {
          console.error("❌ LDAP search res error:", err);
          client.unbind();
          reject(err);
        });
      });
    });
  });
};

// ✅ Helper to flatten LDAP attributes
const flatten = (val) => (Array.isArray(val) ? val[0] : val);

// ✅ Sync LDAP User to Database (JIT Provisioning)
const syncLdapUserToDb = async (ldapUser) => {
  try {
    const uid = flatten(ldapUser.uid);
    console.log("🔄 Syncing LDAP user to DB:", uid);

    // 1. Upsert into LDAP_Users table
    let cachedLdapUser = await LDAP_Users.findOne({ where: { uid: uid } });

    const ldapUserData = {
      cn: flatten(ldapUser.cn) || uid,
      sn: flatten(ldapUser.sn) || uid,
      givenName: flatten(ldapUser.givenName) || uid,
      mail: flatten(ldapUser.mail),
      uid: uid,
      uidNumber: parseInt(flatten(ldapUser.uidNumber)) || 0,
      gidNumber: parseInt(flatten(ldapUser.gidNumber)) || 0,
      homeDirectory: flatten(ldapUser.homeDirectory),
      userPassword: flatten(ldapUser.userPassword) || "",
    };

    if (cachedLdapUser) {
      await cachedLdapUser.update(ldapUserData);
    } else {
      cachedLdapUser = await LDAP_Users.create(ldapUserData);
      console.log("✅ LDAP_Users entry created");
    }

    // 2. Ensure User exists in 'users' table
    let localUser = await User.findOne({ where: { username: uid } });

    if (!localUser) {
      localUser = await User.create({
        username: uid,
        uid: cachedLdapUser.id,
        auth_type: "LDAP",
        isLoggedIn: 1,
        password: "",
        personnel_id: null,
      });
      console.log("✅ Local User created via JIT");
    } else {
      if (localUser.uid !== cachedLdapUser.id) {
        await localUser.update({ uid: cachedLdapUser.id });
      }
    }

    return localUser;
  } catch (error) {
    console.error("❌ Error syncing LDAP user to DB:", error);
    throw error;
  }
};

// ✅ Local Authentication Function
const authenticateLocal = async (username, password) => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new Error("Invalid local credentials.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid local credentials.");
  }

  return user;
};

// ✅ Fetch groupId directly from DB
const getUserGroupId = async (username) => {
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.error("❌ Error: User not found for", username);
      return null;
    }

    const mapping = await UserGroupMapping.findOne({ where: { user_id: user.id } });

    if (!mapping) {
      // console.warn("⚠️ User has no group assigned:", username);
      return null;
    }

    return mapping.group_id;
  } catch (error) {
    console.error("❌ Error fetching user groupId:", error.message);
    return null;
  }
};

exports.Login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // ✅ Check if associated personnel is deleted
  const checkPersonnelStatus = async (username) => {
    const userRecord = await User.findOne({ where: { username } });
    if (userRecord && userRecord.personnel_id) {
      // Sequelize paranoid mode: findByPk will return null if personnel is soft-deleted
      const personnel = await Personnel.findByPk(userRecord.personnel_id);
      if (!personnel) {
        return false; // Personnel is deleted or not found
      }
    }
    return true; // Not associated with personnel OR personnel is active
  };

  try {
    let user;
    let groupId;

    // 🔍 Attempt LDAP Authentication First
    try {
      // Check status first
      const isPersonnelActive = await checkPersonnelStatus(username);
      if (!isPersonnelActive) {
        return res.status(403).json({ message: "Account disabled. Associated personnel record is deleted." });
      }

      const ldapUser = await authenticateLDAP(username, password);
      groupId = await getUserGroupId(username); // Get groupId from DB or null if none

      // ✅ Logic requested: If CN is "Team Leaders" or gidNumber is 2000
      const isTeamLeader =
        (ldapUser.cn.toLowerCase() === "team leaders") ||
        (ldapUser.gidNumber == 2000);

      if (!groupId && isTeamLeader) {
        console.log("🔍 Detected 'Team Leader' via CN or gidNumber(2000). Attempting to assign 'Team Leader' group...");
        try {
          const Group = require("../models/Group");
          const UserGroupMapping = require("../models/UserGroupMapping");

          const teamLeaderGroup = await Group.findOne({ where: { name: "Team Leader" } });

          if (teamLeaderGroup) {
            // Check if mapping exists to be safe
            const existingMapping = await UserGroupMapping.findOne({
              where: { user_id: ldapUser.username } // user_id in mapping is string username? need to verify schema. 
              // Wait, previous code used userId from `getUserGroupId` which fetches from `api/users_access`.
              // `getUserGroupId` calls `axios.get .../api/users_access/${username}` which returns `id`.
              // So user_id in mapping is likely the User PK (integer or uuid).
            });

            // We need the User PK. 
            // Let's fetch the local user object first to get the ID.
            const User = require("../models/User");
            const localUser = await User.findOne({ where: { username: ldapUser.username } });

            if (localUser) {
              await UserGroupMapping.destroy({ where: { user_id: localUser.id } }); // Clear any existing
              await UserGroupMapping.create({
                user_id: localUser.id,
                group_id: teamLeaderGroup.id
              });
              groupId = teamLeaderGroup.id; // Update groupId for the token
              console.log("✅ Automatically assigned 'Team Leader' group to user.");
            }
          } else {
            console.warn("⚠️ 'Team Leader' group not found in database.");
          }
        } catch (autoAssignErr) {
          console.error("❌ Error auto-assigning Team Leader group:", autoAssignErr);
        }
      }

      console.log("Group ID: ", groupId);
      user = {
        id: ldapUser.username,
        username: ldapUser.username,
        groupId: groupId,
        fullName: ldapUser.fullName || ldapUser.username,
        // Debugging fields
        cn: ldapUser.cn,
        gidNumber: ldapUser.gidNumber
      };

      // ✅ Generate JWT token for LDAP user
      const token = generateToken(user);
      return res.json({ success: true, token, user });
    } catch (ldapErr) {
      console.log(`LDAP authentication failed: ${ldapErr}`);
    }

    // 🔍 Fall back to Local Authentication
    try {
      // Check status if not already checked (though we checked above, it's safer)
      const isPersonnelActive = await checkPersonnelStatus(username);
      if (!isPersonnelActive) {
        return res.status(403).json({ message: "Account disabled. Associated personnel record is deleted." });
      }

      user = await authenticateLocal(username, password);
      groupId = await getUserGroupId(username); // Use stored groupId from API

      // ✅ Generate JWT token for Local user
      const token = generateToken({ ...user, groupId });
      return res.json({ success: true, token, user });
    } catch (localErr) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during authentication.", error: error.message });
  }
};


// ✅ Middleware to Protect Routes
exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token. Access denied." });
  }
};
