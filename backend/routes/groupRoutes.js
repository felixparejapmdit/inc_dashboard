const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groupsController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all groups
router.get("/api/groups", verifyToken, groupsController.getAllGroups);

// Get a single group by ID
router.get("/api/groups/:id", verifyToken, groupsController.getGroupById);

// Get group ID for a specific user
router.get(
  "/api/groups/user/:userId",
  verifyToken,
  groupsController.getGroupIdByUserId
);

// Get users in a specific group
router.get(
  "/api/groups/:groupId/users",
  verifyToken,
  groupsController.getGroupUsers
);

// Update a user's group by user ID
//router.put("/api/user-groups/:userId", groupsController.updateUserGroup);

// Create a new group
router.post("/api/groups/", verifyToken, groupsController.createGroup);

// Update a group by ID
router.put("/api/groups/:id", verifyToken, groupsController.updateGroup);

// Delete a group by ID
router.delete("/api/groups/:id", verifyToken, groupsController.deleteGroup);

module.exports = router;
