// migrateLdapToPmdLoginUsers.js
require("dotenv").config();
const axios = require("axios");
const users = require("./models/users"); // Ensure path is correct

// Function to fetch LDAP users from the API
async function fetchLdapUsers() {
  try {
    const response = await axios.get("http://localhost:5000/api/ldap/users"); // Ensure this URL is correct
    return response.data; // Assuming the API response is an array of LDAP user objects
  } catch (error) {
    console.error("Error fetching LDAP users:", error);
    throw error;
  }
}

// Migration function
async function migrateLdapToPmdLoginUsers() {
  try {
    // Fetch LDAP users
    const ldapUsers = await fetchLdapUsers();
    if (ldapUsers.length === 0) {
      console.log("No LDAP users found or unable to connect to LDAP API.");
      return;
    }

    // Perform the migration logic
    for (const ldapUser of ldapUsers) {
      // Check if the user already exists in users by UID
      const existingUser = await users.findOne({
        where: { username: ldapUser.uid },
      });

      if (!existingUser) {
        // Map LDAP data to users fields
        const newUser = {
          uid: ldapUser.uid,
          personnel_id: null, // Set to null or map if personnel_id exists elsewhere
          username: ldapUser.uid, // Map LDAP 'uid' to 'username' field in users
          password: ldapUser.userPassword, // Assuming the password format matches
          avatar: null, // Set avatar if available
          isLoggedIn: 0, // Default to 0 (not logged in)
          last_login: null,
          auth_type: "LDAP", // Since data is from LDAP
          failed_attempts: 0, // Initialize failed attempts to 0
          last_failed_attempt: null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Insert the new user into users
        await users.create(newUser);
        console.log(`User ${ldapUser.uid} migrated successfully.`);
      } else {
        console.log(`User ${ldapUser.uid} already exists in users.`);
      }
    }
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Execute the migration
migrateLdapToPmdLoginUsers();
