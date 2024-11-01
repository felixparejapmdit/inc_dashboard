const express = require("express");
const router = express.Router();
const ldap = require("ldapjs");

const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;

const GROUP_BASE_DN = process.env.GROUP_BASE_DN; // Define your group base DN here

console.log("LDAP URL:", LDAP_URL); // Debug: Check LDAP URL

// const LDAP_URL = process.env.LDAP_URL;
// const BIND_DN = process.env.BIND_DN;
// const BIND_PASSWORD = process.env.BIND_PASSWORD;
// const BASE_DN = process.env.BASE_DN;

// Utility function to create LDAP client
const createLdapClient = () => {
  return ldap.createClient({
    url: LDAP_URL,
  });
};

router.get("/api/ldap/test-connection", async (req, res) => {
  const client = ldap.createClient({ url: process.env.LDAP_URL });

  client.bind(process.env.BIND_DN, process.env.BIND_PASSWORD, (err) => {
    if (err) {
      console.error("LDAP connection failed:", err);
      res.status(500).json({ message: "LDAP connection failed", error: err });
    } else {
      console.log("LDAP connection successful");
      res.status(200).json({ message: "LDAP connection successful" });
    }
    client.unbind(); // Ensure client is unbound after the test
  });
});

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

// LDAP Authentication
// LDAP Login API endpoint
router.post("/api/login_ldap", (req, res) => {
  const { username, password } = req.body;

  const client = ldap.createClient({
    url: LDAP_URL,
  });

  // Bind to LDAP server
  client.bind(BIND_DN, BIND_PASSWORD, (err) => {
    if (err) {
      return res.status(500).json({ message: "LDAP bind failed", error: err });
    }

    // Search for the user in LDAP
    const searchOptions = {
      filter: `(uid=${username})`, // Change 'uid' if necessary
      scope: "sub",
      attributes: ["dn", "userPassword"], // Fetch the DN and password attributes
    };

    client.search(BASE_DN, searchOptions, (searchErr, searchRes) => {
      if (searchErr) {
        return res
          .status(500)
          .json({ message: "LDAP search failed", error: searchErr });
      }

      let foundUser = null;
      searchRes.on("searchEntry", (entry) => {
        foundUser = entry.object;
      });

      searchRes.on("end", (result) => {
        if (!foundUser) {
          return res.status(401).json({ message: "User not found" });
        }

        // Bind using the user's DN and password to verify the password
        client.bind(foundUser.dn, password, (authErr) => {
          if (authErr) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          // Password is correct, user is authenticated
          return res.status(200).json({ message: "Login successful" });
        });
      });

      searchRes.on("error", (err) => {
        res.status(500).json({ message: "LDAP search failed", error: err });
      });
    });
  });
});

// Fetch all LDAP users
router.get("/api/ldap/users", async (req, res) => {
  // <-- Corrected this line
  console.log("Fetching all users from LDAP");

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

  const searchLDAP = () => {
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
          client.unbind();
          resolve(users);
        });

        result.on("error", (err) => {
          client.unbind();
          reject(err);
        });
      });
    });
  };

  try {
    await bindClient();
    const users = await searchLDAP();
    res.json(users);
  } catch (err) {
    console.error("LDAP error:", err);
    res.status(500).json({ error: err.message });
  }
});

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

// Utility function to create and bind the LDAP client
const bindClient = async () => {
  const client = ldap.createClient({ url: LDAP_URL });

  return new Promise((resolve, reject) => {
    client.bind(BIND_DN, BIND_PASSWORD, (err) => {
      if (err) {
        console.error("LDAP bind error:", err);
        client.unbind();
        reject(err);
      } else {
        resolve(client);
      }
    });
  });
};

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
