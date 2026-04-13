const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Manideep@1',
    database: process.env.DB_NAME || 'my_april',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const db = pool.promise();

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ MySQL connected to database: ' + process.env.DB_NAME);
    connection.release();
});

module.exports = db;
