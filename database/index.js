const mysql = require("mysql2");
const config = require("../config/config");

// Load environment-specific configuration
const envConfig = require(`../config/${process.env.NODE_ENV || "dev"}`);
const mergedConfig = { ...config, ...envConfig };

const pool = mysql.createPool({
  host: mergedConfig.db.host,
  user: mergedConfig.db.user,
  password: mergedConfig.db.password,
  port: mergedConfig.db.port,
  database: mergedConfig.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Attempt to acquire a connection to the database for logging purposes
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error acquiring initial database connection:", err);
  } else {
    console.log("Connected to the database!");
    connection.release();
  }
});

module.exports = pool.promise(); // Export the pool with promise support
