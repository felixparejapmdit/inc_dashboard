const express = require("express");
const router = express.Router();
const loginController = require("../controllers/authController");

router.post("/api/auth/login", loginController.Login); // ✅ Login route

module.exports = router;
