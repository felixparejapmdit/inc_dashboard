const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3308,
        user: process.env.MYSQL_USER || 'portal_dev',
        password: process.env.MYSQL_PASSWORD || 'M@sunur1n',
        database: process.env.MYSQL_DATABASE || 'ppi',
        multipleStatements: true
    });

    try {
        console.log('📦 Connected to database');
        console.log('🚀 Running face recognition migration...\n');

        const sqlFile = path.join(__dirname, 'backend', 'migrations', 'add_face_recognition_tables.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        await connection.query(sql);

        console.log('\n✅ Migration completed successfully!');
        console.log('   - face_recognition table created');
        console.log('   - face_recognition_logs table created');
        console.log('   - Indexes added');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigration();
