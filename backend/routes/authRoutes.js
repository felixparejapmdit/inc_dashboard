const express = require("express");
const router = express.Router();
const loginController = require("../controllers/authController");

const authMiddleware = require("../middlewares/auth"); // Import the authMiddleware

router.post("/api/auth/login", loginController.Login); // ✅ Login route

// ✅ Example of protected route
router.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    user: req.user,
  });
});

module.exports = router;
