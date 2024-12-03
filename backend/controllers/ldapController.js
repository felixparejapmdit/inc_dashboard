// controllers/ldapController.js
const ldap = require("ldapjs");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// Load environment variables
const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;

// Utility function to create an LDAP client
const createLdapClient = () => {
  return ldap.createClient({ url: LDAP_URL });
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
  const client = createLdapClient();

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

        result.on("end", () => resolve(users));
        result.on("error", (err) => reject(err));
      });
    });

  try {
    await bindClient();
    const users = await fetchUsers();
    res.json(users);
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
