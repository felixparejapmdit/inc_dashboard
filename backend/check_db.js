const sequelize = require('./config/database');
const PersonnelHistory = require('./models/PersonnelHistory');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Check if table exists
        const [results] = await sequelize.query("SHOW TABLES LIKE 'personnel_history'");
        if (results.length === 0) {
            console.log("Table 'personnel_history' DOES NOT EXIST.");

            // Create table if it doesn't exist
            console.log("Attempting to create table...");
            await PersonnelHistory.sync();
            console.log("Table 'personnel_history' created successfully.");
        } else {
            console.log("Table 'personnel_history' exists.");
        }
    } catch (error) {
        console.error('Unable to connect to the database or check table:', error);
    } finally {
        await sequelize.close();
    }
}

check();
