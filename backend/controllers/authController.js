const ldap = require("ldapjs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Your local user model
require("dotenv").config();

// ✅ Load environment variables
const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// ✅ Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, groupId: user.groupId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ✅ LDAP Authentication Function
const authenticateLDAP = (username, password) => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: LDAP_URL });

    console.log(`🔍 Searching for LDAP user: ${username}`);

    const searchOptions = {
      filter: `(uid=${username})`,
      scope: "sub",
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

        res.on("searchEntry", (entry) => {
          console.log(
            "✅ Found LDAP Entry:",
            JSON.stringify(entry.pojo, null, 2)
          );

          // Extract the correct DN from `entry.pojo`
          userDN = entry.pojo.objectName; // Ensure we get the correct DN
          console.log("✅ Extracted User DN:", userDN);
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
            resolve({ userDN, username });
          });
        });
      });
    });
  });
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

// ✅ Login Controller
exports.Login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    let user;

    // 🔍 Attempt LDAP Authentication First
    try {
      const ldapUser = await authenticateLDAP(username, password);
      user = {
        id: ldapUser.username,
        username: ldapUser.username,
        groupId: "LDAP_GROUP",
        fullName: ldapUser.username,
      };

      // ✅ Generate JWT token for LDAP user
      const token = generateToken(user);
      return res.json({ success: true, token, user });
    } catch (ldapErr) {
      console.log(`LDAP authentication failed: ${ldapErr}`);
    }

    // 🔍 Fall back to Local Authentication
    try {
      user = await authenticateLocal(username, password);

      // ✅ Generate JWT token for Local user
      const token = generateToken(user);
      return res.json({ success: true, token, user });
    } catch (localErr) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during authentication.", error });
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
