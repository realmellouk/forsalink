// Database connection configuration
const mysql = require('mysql2');

// Create connection pool for better performance
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  database: 'forsalinkk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert to promise-based API for async/await
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully');
    connection.release();
  }
});

module.exports = promisePool;