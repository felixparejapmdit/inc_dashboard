const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL');

    const queries = [
        "ALTER TABLE lokal_profiles MODIFY COLUMN district VARCHAR(255);",
        "ALTER TABLE lokal_profiles MODIFY COLUMN lokal VARCHAR(255);",
        "ALTER TABLE lokal_profiles MODIFY COLUMN imageUrl LONGTEXT;"
    ];

    let completed = 0;

    queries.forEach((query) => {
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', query, error);
            } else {
                console.log('Successfully executed:', query);
            }
            completed++;
            if (completed === queries.length) {
                console.log('All queries completed.');
                connection.end();
                process.exit(0);
            }
        });
    });
});
