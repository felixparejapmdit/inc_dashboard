// Load environment variables and sequelize
require("dotenv").config();
const sequelize = require("./config/database");
const Personnel = require("./models/personnels");
const User = require("./models/users");

// Debug log to check if environment variables are loaded
console.log("Database Config:", {
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_HOST,
});

// Function to update personnel_id in users table
async function updatePersonnelIdsInUsers() {
  try {
    // Test the database connection first
    await sequelize.authenticate();
    console.log("Connection to MySQL has been established successfully.");

    // Retrieve all users without personnel_id
    const users = await User.findAll({
      where: { personnel_id: null },
    });

    for (const user of users) {
      // Split the username into givenname and lastname based on the `.` separator
      const [givenname, lastname] = user.username.split(".");

      if (givenname && lastname) {
        // Find the matching personnel record
        const personnel = await Personnel.findOne({
          where: { givenname, lastname },
        });

        if (personnel) {
          // Update the personnel_id in the users table
          await user.update({ personnel_id: personnel.personnel_id });
          console.log(`Updated personnel_id for user ${user.username}`);
        } else {
          console.log(`No matching personnel found for user ${user.username}`);
        }
      } else {
        console.log(`Invalid username format for user ${user.username}`);
      }
    }

    console.log("Personnel IDs updated successfully in users table.");
  } catch (error) {
    console.error("Error updating personnel IDs:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the update function
updatePersonnelIdsInUsers();
