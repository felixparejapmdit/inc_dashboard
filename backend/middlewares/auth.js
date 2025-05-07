const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access token is missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Token expired or invalid. Please log in again." });
    }
    req.user = decoded;
    next();
  });
};

module.exports = authMiddleware;
