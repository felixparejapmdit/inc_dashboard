const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // You can change this to a more secure key

// Function to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      groupId: user.groupId,
    },
    JWT_SECRET,
    { expiresIn: "1h" } // Token expires in 1 hour
  );
};

// Function to verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token is invalid or expired");
  }
};

module.exports = { generateToken, verifyToken };
