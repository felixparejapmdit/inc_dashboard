// middlewares/snipeitAuthMiddleware.js
require("dotenv").config();

const TEAMS = {
  buildingAdmin: process.env.REACT_APP_BUILDING_ADMIN_TOKEN,
  videoStreaming: process.env.REACT_APP_VIDEO_STREAMING_TOKEN,
  pmdIT: process.env.REACT_APP_PMDIT_TOKEN,
  eis: process.env.REACT_APP_EIS_TOKEN,
};

/**
 * Verifies the token for Snipe-IT requests.
 * The client must provide:
 *   - Authorization: Bearer <token>
 *   - x-team: <teamName>   (e.g., buildingAdmin, videoStreaming, pmdIT, eis)
 */
const verifySnipeItToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const teamName = req.headers["x-team"];

  if (!teamName || !TEAMS[teamName]) {
    return res.status(400).json({ message: "Invalid or missing team header" });
  }

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Compare token from request with token from .env for that team
  if (token !== TEAMS[teamName]) {
    return res.status(401).json({ message: "Unauthorized: Invalid token for this team" });
  }

  // Attach team info to request for controller use
  req.team = teamName;
  next();
};

module.exports = verifySnipeItToken;
