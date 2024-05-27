const mysql = require('mysql2/promise');

require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost' || process.env.DB_HOST,
    user: 'root' || process.env.DB_USERNAME,
    password: 'root' || process.env.PASSWORD,
    database: 'modiste' || process.env.DB_NAME,
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