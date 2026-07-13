const express = require("express");
const router = express.Router();
const dar = require("../controllers/darController");
const verifyToken = require("../middlewares/authMiddleware");

// ─── Categories ────────────────────────────────────────────────────────────────
router.get("/api/dar/categories", verifyToken, dar.getCategories);

// ─── Tasks ─────────────────────────────────────────────────────────────────────
router.get("/api/dar/tasks",         verifyToken, dar.getTasks);
router.get("/api/dar/tasks/:id",     verifyToken, dar.getTaskById);
router.post("/api/dar/tasks",        verifyToken, dar.createTask);
router.put("/api/dar/tasks/:id/end-time", verifyToken, dar.updateTaskEndTime);
router.put("/api/dar/tasks/:id",     verifyToken, dar.updateTask);
router.delete("/api/dar/tasks/:id",  verifyToken, dar.deleteTask);

// ─── Accomplished Logs ─────────────────────────────────────────────────────────
router.get("/api/dar/logs",          verifyToken, dar.getLogs);
router.post("/api/dar/logs",         verifyToken, dar.upsertLog);

// ─── Daily Activity Reports ────────────────────────────────────────────────────
router.get("/api/dar/reports",       verifyToken, dar.getReports);
router.post("/api/dar/reports",      verifyToken, dar.upsertReport);
router.delete("/api/dar/reports/:id",verifyToken, dar.deleteReport);

// ─── Signature ─────────────────────────────────────────────────────────────────
router.get("/api/dar/signature",     verifyToken, dar.getSignature);
router.put("/api/dar/signature",     verifyToken, dar.saveSignature);

module.exports = router;
