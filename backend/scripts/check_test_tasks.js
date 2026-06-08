const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "172.18.121.20",
  user: "portal-test-server",
  password: "M@sunur1n portal test server",
  database: "portal-test-server",
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Failed to connect to remote database:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to remote database.");

  connection.query("DESCRIBE tasks", (err, results) => {
    if (err) {
      console.error("❌ Error describing table:", err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log("=== COLUMNS IN REMOTE TASKS TABLE ===");
    console.log(JSON.stringify(results, null, 2));
    
    connection.end();
  });
});
