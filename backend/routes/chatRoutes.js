const express = require("express");
const { chatbotHandler } = require("../controllers/chatController");

const router = express.Router();

// ✅ Chatbot Route
router.post("/api/chat", chatbotHandler);

module.exports = router;
