const mysql = require('mysql2/promise');

require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.PASSWORD || 'root',
    database: process.env.DB_NAME || 'modiste',
    port: '3306',
    connectionLimit: 10, // Adjust the limit as needed
});

// Function to execute queries
async function executeQuery(sql, values) {
    const connection = await pool.getConnection();
    try {
        const [rows, fields] = await connection.execute(sql, values);
        return rows;
    } finally {
        connection.release(); // Release the connection back to the pool
    }
}

module.exports = {
    executeQuery
};