const express = require("express");
const router = express.Router();

const ldapController = require("../controllers/ldapController");

const bcrypt = require("bcryptjs");
const ldap = require("ldapjs");

const fs = require("fs");
const path = require("path");

const LDAP_URL = process.env.LDAP_URL;
const BIND_DN = process.env.BIND_DN;
const BIND_PASSWORD = process.env.BIND_PASSWORD;
const BASE_DN = process.env.BASE_DN;

const auth = require("../middlewares/auth");

// Define routes and associate them with controller functions
router.get("/api/test_ldap_connection", ldapController.testLdapConnection);
router.get("/api/ldap/users_json", ldapController.getUsersFromJson);
router.get("/api/ldap/users", ldapController.getLdapUsersAndGroups);
router.get(
  "/ldap/user_json/:username",
  ldapController.authenticateUserFromJson
);

router.get("/ldap/user/:username", ldapController.getUserByUsername);
//router.get("/ldap/user/:username", auth, ldapController.getUserByUsername);

router.get("/ldap/groups", ldapController.getGroups);

router.post("/sync-ldap-user", ldapController.SyncLdapUser);

// Route to change LDAP password
router.post("/api/ldap/change-password", ldapController.changePassword);

module.exports = router;
