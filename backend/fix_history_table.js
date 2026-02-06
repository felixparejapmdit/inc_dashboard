const db = require('./db');

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS personnel_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personnel_id BIGINT(20) NOT NULL,
    action ENUM('In', 'Out') NOT NULL,
    reason VARCHAR(255),
    performed_by VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery, (err, results) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log("Table 'personnel_activity_logs' verified/created successfully.");
    process.exit(0);
});
