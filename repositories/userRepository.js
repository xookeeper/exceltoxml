const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Register user
exports.registerUser = (uid, name, email, adminId, role, callback) => {
  const query = 'INSERT INTO users (uid, name, email, adminId, role) VALUES (?, ?, ?, ?, ?)';
  pool.query(query, [uid, name, email, adminId, role], callback);
};

// Add admin
exports.addAdmin = (firstname, lastname, email, role, contact, callback) => {
  const query = 'INSERT INTO admins (firstname, lastname, email, role, contact) VALUES (?, ?, ?, ?, ?)';
  pool.query(query, [firstname, lastname, email, role, contact], callback);
};

// Get all admins
exports.getAllAdmins = (callback) => {
  const query = 'SELECT * FROM admins';
  pool.query(query, callback);
};

// Get users added by the current admin
exports.getUsersByAdmin = (adminId, callback) => {
  const query = 'SELECT * FROM users WHERE adminId = ? AND deleted_at IS NULL';
  pool.query(query, [adminId], callback);
};

// Update user
exports.updateUser = (uid, name, email, adminId, role, callback) => {
  const query = 'UPDATE users SET name = ?, email = ?, adminId = ?, role = ? WHERE uid = ?';
  pool.query(query, [name, email, adminId, role, uid], callback);
};

// Soft delete user
exports.softDeleteUser = (uid, callback) => {
  const query = 'UPDATE users SET deleted_at = NOW() WHERE uid = ?';
  pool.query(query, [uid], callback);
};

// Get user by email and check if not deleted
exports.getUserByEmail = (email, callback) => {
  const query = 'SELECT role, deleted_at FROM users WHERE email = ?';
  pool.query(query, [email], (err, results) => {
    if (err) {
      return callback(err);
    }
    if (results.length > 0) {
      const user = results[0];
      if (user.deleted_at) {
        return callback(null, { deleted: true });
      }
      return callback(null, { role: user.role, deleted: false });
    }
    return callback(null, null);
  });
};