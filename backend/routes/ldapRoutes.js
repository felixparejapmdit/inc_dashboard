const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const ldap = require("ldapjs");

const fs = require("fs");
const path = require("path");

const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;
const GROUP_BASE_DN = "dc=pmdmc,dc=net"; // Use this for group search

// Utility function to create LDAP client
const createLdapClient = () => {
  return ldap.createClient({
    url: LDAP_URL,
  });
};

// Endpoint to test LDAP connection
router.get("/api/test_ldap_connection", (req, res) => {
  const client = createLdapClient();

  // Bind to the LDAP server
  client.bind(BIND_DN, BIND_PASSWORD, (err) => {
    if (err) {
      console.error("LDAP connection failed:", err);
      return res
        .status(500)
        .json({ message: "LDAP connection failed", error: err });
    }

    // Connection successful
    console.log("Successfully connected to LDAP server");
    res.status(200).json({ message: "LDAP connection successful" });

    // Unbind the client
    client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error("LDAP unbind error:", unbindErr);
      }
    });
  });
});

// Endpoint to read LDAP data from ldap_data.json
router.get("/api/ldap/users_json", (req, res) => {
  const filePath = path.join(__dirname, "../data/ldap_users.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading LDAP data file:", err);
      return res
        .status(500)
        .json({ error: "Error reading LDAP data fil12e", filePath });
    }
    const ldapData = JSON.parse(data);
    res.json(ldapData.LDAP_Users);
  });
});

// Fetch all LDAP users and their group names
router.get("/api/ldap/users", async (req, res) => {
  console.log("Fetching all users and groups from LDAP");

  const client = createLdapClient();

  const bindClient = () => {
    return new Promise((resolve, reject) => {
      client.bind(BIND_DN, BIND_PASSWORD, (err) => {
        if (err) {
          client.unbind();
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const fetchUsers = () => {
    return new Promise((resolve, reject) => {
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
  };

  const fetchGroups = () => {
    return new Promise((resolve, reject) => {
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
  };

  try {
    await bindClient();
    const users = await fetchUsers();
    const groups = await fetchGroups();

    // Utility function to extract attribute values with improved handling
    const getAttributeValue = (attributes, type) => {
      if (Array.isArray(attributes)) {
        const attribute = attributes.find(
          (attr) => attr.type === type || attr.name === type
        );
        if (attribute) {
          // Check both `vals` and `values` fields to handle LDAP attribute variations
          return attribute.vals
            ? attribute.vals[0]
            : attribute.values
            ? attribute.values[0]
            : "N/A";
        }
      } else if (typeof attributes === "object" && attributes[type]) {
        // Handle case where `attributes` is an object with direct key-value pairs
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
        groupName: userGroup ? userGroup.groupName : "Unknown",
      };
    });

    res.json(usersWithGroups);
  } catch (err) {
    console.error("LDAP error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to authenticate user using ldap_data.json
router.get("/ldap/user_json/:username", (req, res) => {
  const username = req.params.username;
  const providedPassword = req.query.password; // Extract plain password from query

  // Read data from ldap_data.json
  const filePath = path.join(__dirname, "../data/ldap_users.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading LDAP data file:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      const ldapData = JSON.parse(data);
      const user = ldapData.LDAP_Users.find((user) => user.uid === username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!providedPassword) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Compare provided password with the stored bcrypt hash
      const isPasswordValid = bcrypt.compareSync(
        providedPassword,
        user.userPassword
      );
      if (isPasswordValid) {
        // Password match; return user data (excluding password)
        res.json({
          uid: user.uid,
          cn: user.cn,
          mail: user.mail,
          gidNumber: user.gidNumber,
          memberOf: user.memberOf,
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

//Login using PMD LDAP Credentials by username
router.get("/ldap/user/:username", async (req, res) => {
  const username = req.params.username;
  console.log("Received request for username:", username);

  // Create a new client for each request
  const client = ldap.createClient({
    url: LDAP_URL,
  });

  const bindClient = () => {
    return new Promise((resolve, reject) => {
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
  };

  const searchLDAP = () => {
    return new Promise((resolve, reject) => {
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
              // Get the password from the LDAP server
              const password = attribute.vals[0];
              user[attribute.type] = password;
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
  };

  try {
    await bindClient(); // Bind to LDAP server
    const user = await searchLDAP(); // Search for the user
    res.json(user); // Respond with user data
  } catch (err) {
    console.error("LDAP error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to retrieve groups by common name (cn)
router.get("/api/ldap/groups", (req, res) => {
  const client = ldap.createClient({ url: process.env.LDAP_URL });

  // Bind to the LDAP server
  client.bind(process.env.BIND_DN, process.env.BIND_PASSWORD, (err) => {
    if (err) {
      console.error("LDAP bind error:", err);
      return res.status(500).json({ error: "Failed to bind to LDAP server" });
    }

    const options = {
      filter:
        "(|(objectClass=posixGroup)(objectClass=groupOfNames)(objectClass=groupOfUniqueNames))", // Look for any group-related objectClass
      scope: "sub",
      attributes: ["cn", "gidNumber"], // Request the cn and gidNumber (or adjust attributes as needed)
    };

    const groups = [];
    client.search(
      process.env.GROUP_BASE_DN || "ou=Groups,dc=pmdmc,dc=net",
      options,
      (err, result) => {
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
          console.log(
            "LDAP search completed with result status:",
            result.status
          );
          client.unbind();
          res.json(groups);
        });

        result.on("error", (err) => {
          console.error("LDAP search error:", err);
          client.unbind();
          res.status(500).json({ error: "LDAP search error" });
        });
      }
    );
  });
});

module.exports = router;
