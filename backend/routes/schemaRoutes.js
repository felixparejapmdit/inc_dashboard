const express = require("express");
const router = express.Router();
const schemaController = require("../controllers/schemaController");
// Add authentication middleware if needed (e.g., verifyToken, isAdmin)
// const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Route to check schema status (missing tables)
// Changed to POST to allow sending optional dbConfig in body
router.post("/check", schemaController.checkSchema);

// Route to sync schema (create missing tables)
router.post("/sync", schemaController.syncSchema);

module.exports = router;
