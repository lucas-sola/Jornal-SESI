const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0,
    ssl: { 
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    }
});

module.exports = pool;