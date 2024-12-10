// controllers/ldapController.js
const ldap = require("ldapjs");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const Personnel = require("../models/personnels");
const LdapUser = require("../models/LDAP_Users");
const User = require("../models/User");

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

// Login using PMD LDAP credentials by username
exports.getUserByUsername = async (req, res) => {
  const username = req.params.username;
  console.log("Received request for username:", username);

  const client = createLdapClient();

  const bindClient = () =>
    new Promise((resolve, reject) => {
      client.bind(BIND_DN, BIND_PASSWORD, (err) => {
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
        filter: `(uid=${username})`,
        scope: "sub",
        attributes: ["cn", "sn", "mail", "uid", "userPassword"], // Specify the attributes to retrieve
      };

      const user = {};

      client.search(BASE_DN, searchOptions, (err, result) => {
        if (err) {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error("LDAP unbind error:", unbindErr);
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
              console.error("LDAP unbind error:", unbindErr);
            }
          });

          if (Object.keys(user).length > 0) {
            resolve(user);
          } else {
            reject(new Error("User not found"));
          }
        });

        result.on("error", (err) => {
          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error("LDAP unbind error:", unbindErr);
            }
          });
          reject(err);
        });
      });
    });

  try {
    await bindClient();
    const user = await searchLDAP();
    res.json(user);
  } catch (err) {
    console.error("LDAP error:", err);
    res.status(500).json({ error: err.message });
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
