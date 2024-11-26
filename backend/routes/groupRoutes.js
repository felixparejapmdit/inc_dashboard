const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");

// Get all groups
router.get("/api/groups/", groupsController.getAllGroups);

// Get a single group by ID
router.get("/api/groups/:id", groupsController.getGroupById);

// Create a new group
router.post("/api/groups/", groupsController.createGroup);

// Update a group by ID
router.put("/api/groups/:id", groupsController.updateGroup);

// Delete a group by ID
router.delete("/api/groups/:id", groupsController.deleteGroup);

module.exports = router;
