const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Generate token WITHOUT EXPIRATION
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      groupId: user.groupId,
    },
    JWT_SECRET
  );
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
