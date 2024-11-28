const express = require("express");
const router = express.Router();
const userGroupsController = require("../controllers/userGroupsController");

// Update a user's group by user ID
router.put("/:userId", userGroupsController.updateUserGroup);


module.exports = router;
