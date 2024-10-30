const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users with their available apps
router.get("/api/users", (req, res) => {
  const query = `
    SELECT u.ID, u.username, u.password, u.fullname, u.email, u.avatar, GROUP_CONCAT(a.name) AS availableApps
    FROM users u
    LEFT JOIN available_apps ua ON u.ID = ua.user_id
    LEFT JOIN apps a ON ua.app_id = a.id
    GROUP BY u.ID
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Format results to ensure availableApps is an array
    const formattedResults = Array.isArray(results)
      ? results.map((user) => ({
          ...user,
          availableApps: user.availableApps
            ? user.availableApps.split(",")
            : [],
        }))
      : [];

    res.json(formattedResults);
  });
});

// User login
router.post("/api/users/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    if (results.length > 0) {
      return res.json({ success: true, user: results[0] });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
  });
});

// Add new user with selected apps
router.post("/api/users", (req, res) => {
  const { username, password, name, email, avatarUrl, availableApps } =
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
    [username, password, name, email, avatarUrl],
    (err, results) => {
      if (err) {
        console.error("Error adding user:", err);
        return res
          .status(500)
          .json({ message: "Database error: " + err.message });
      }

      const userId = results.insertId;
      const userAppsQuery =
        "INSERT INTO available_apps (user_id, app_id) VALUES ?";
      const appValues = (availableApps || []).map((appId) => [userId, appId]);

      if (appValues.length > 0) {
        db.query(userAppsQuery, [appValues], (err) => {
          if (err) {
            console.error("Error adding user apps:", err);
            return res
              .status(500)
              .json({ message: "Database error on apps: " + err.message });
          }
          res
            .status(201)
            .json({ message: "User added successfully.", id: userId });
        });
      } else {
        res
          .status(201)
          .json({ message: "User added successfully.", id: userId });
      }
    }
  );
});

// Update user details and assigned apps
router.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const { username, password, name, email, avatarUrl, availableApps } =
    req.body;
  const updatedUser = {
    username,
    password,
    fullname: name, // Ensure `name` is mapped to `fullname`
    email,
    avatar: avatarUrl,
  };

  db.query(
    "UPDATE users SET ? WHERE ID = ?",
    [updatedUser, userId],
    (err, results) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Database update error" });
      }

      db.query(
        "DELETE FROM available_apps WHERE user_id = ?",
        [userId],
        (err) => {
          if (err) {
            console.error("Error clearing user apps:", err);
            return res.status(500).json({ message: "Database error on apps" });
          }

          const appValues = (availableApps || []).map((appId) => [
            userId,
            appId,
          ]);
          if (appValues.length > 0) {
            db.query(
              "INSERT INTO available_apps (user_id, app_id) VALUES ?",
              [appValues],
              (err) => {
                if (err) {
                  console.error("Error updating user apps:", err);
                  return res
                    .status(500)
                    .json({ message: "Database error on apps" });
                }
                res.json({ message: "User updated successfully" });
              }
            );
          } else {
            res.json({ message: "User updated successfully" });
          }
        }
      );
    }
  );
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
  const query = "UPDATE users SET isLoggedIn = ? WHERE id = ?";

  db.query(query, [false, userId], (err, results) => {
    if (err) {
      console.error("Error updating user logout status:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User logged out successfully" });
  });
});

// Logged-In User Endpoint
router.get("/api/users/logged-in", (req, res) => {
  const query = `
    SELECT u.*, GROUP_CONCAT(a.name) AS availableApps
    FROM users u
    LEFT JOIN available_apps ua ON u.ID = ua.user_id
    LEFT JOIN apps a ON ua.app_id = a.id
    WHERE u.isLoggedIn = ?
    GROUP BY u.ID
  `;

  db.query(query, [true], (err, results) => {
    if (err) {
      console.error("Error fetching logged-in user:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      const user = {
        ...results[0],
        availableApps: results[0].availableApps
          ? results[0].availableApps.split(",")
          : [],
      };
      res.json(user); // Return the logged-in user with available apps as an array
    } else {
      res.status(404).json({ message: "No user is currently logged in" });
    }
  });
});

module.exports = router;
