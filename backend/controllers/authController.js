const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const bcrypt = require("bcryptjs");
const db = require("../config/database"); // Ensure Sequelize or DB config is used

const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, groupId: user.groupId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const client = ldap.createClient({ url: LDAP_URL });

  // Authenticate with LDAP
  const userDN = `uid=${username},${BASE_DN}`;
  client.bind(userDN, password, async (err) => {
    if (!err) {
      console.log(`✅ LDAP Authentication successful for ${username}`);

      try {
        // Fetch the user’s group from MySQL
        const [user] = await db.query(
          "SELECT id, username, group_id FROM users WHERE username = ?",
          { replacements: [username] }
        );

        if (!user) {
          return res.status(403).json({ message: "User not found in system" });
        }

        const token = generateToken(user);
        return res.json({ token, message: "Login successful!" });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({ message: "Server error" });
      }
    }

    console.error("❌ LDAP authentication failed:", err.message);
    console.log("🔄 Attempting local authentication...");

    try {
      // Try local authentication
      const [user] = await db.query(
        "SELECT id, username, password, group_id FROM users WHERE username = ?",
        { replacements: [username] }
      );

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with bcrypt hash
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      return res.json({ token, message: "Local login successful" });
    } catch (error) {
      console.error("Database authentication error:", error);
      return res.status(500).json({ message: "Authentication error" });
    }
  });
};
