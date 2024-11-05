// scripts/migrateLdapToPmdLoginUsers.js
const bcrypt = require("bcrypt"); // Assuming bcrypt for hashing local passwords if needed
const LDAP_Users = require("../models/LDAP_Users");
const PMD_Login_Users = require("../models/PMD_Login_Users");

async function migrateLdapToPmdLoginUsers() {
  try {
    // Step 1: Fetch all users from LDAP_Users
    const ldapUsers = await LDAP_Users.findAll();

    for (const ldapUser of ldapUsers) {
      const existingPmdUser = await PMD_Login_Users.findOne({
        where: { uid: ldapUser.id },
      });

      // Step 2: Check if user already exists in PMD_Login_Users
      if (!existingPmdUser) {
        // Generate a local username and password if needed (example, could use ldapUser.uid as username)
        const localUsername = ldapUser.uid || ldapUser.cn;
        const localPassword = await bcrypt.hash("defaultPassword", 10); // Replace with a secure default if needed

        // Step 3: Insert new user into PMD_Login_Users
        await PMD_Login_Users.create({
          uid: ldapUser.id,
          personnel_id: null, // Adjust if you have personnel_id mapping
          local_username: localUsername,
          local_password: localPassword,
          auth_type: "LDAP", // Default to LDAP authentication
          online_status: 0, // Default status
          failed_attempts: 0, // Default failed attempts
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log(`Migrated LDAP user ${localUsername} to PMD_Login_Users.`);
      } else {
        console.log(
          `User with UID ${ldapUser.id} already exists in PMD_Login_Users.`
        );
      }
    }

    console.log("Migration complete.");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Run the migration
migrateLdapToPmdLoginUsers();
