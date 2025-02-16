const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Protected route example
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}. Your Group ID is ${req.user.groupId}`,
  });
});

module.exports = router;
