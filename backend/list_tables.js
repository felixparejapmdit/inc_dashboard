const db = require('./db');
db.query("SHOW TABLES LIKE 'personnel%'", (err, res) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
});
