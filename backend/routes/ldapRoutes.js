const express = require("express");
const router = express.Router();

const ldapController = require("../controllers/ldapController");

// Define routes and associate them with controller functions

router.get("/ldap/user/:username", ldapController.getUserByUsername);

router.get("/api/test_ldap_connection", ldapController.testLdapConnection);

router.get("/api/ldap/users_json", ldapController.getUsersFromJson);
router.get("/api/ldap/users", ldapController.getLdapUsersAndGroups);
router.get(
  "/ldap/user_json/:username",
  ldapController.authenticateUserFromJson
);

//router.get("/ldap/user/:username", auth, ldapController.getUserByUsername);

router.get("/ldap/groups", ldapController.getGroups);

router.post("/sync-ldap-user", ldapController.SyncLdapUser);

// Route to change LDAP password
router.post("/api/ldap/change-password", ldapController.changePassword);

module.exports = router;
