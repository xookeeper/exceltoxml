const db = require('../dbConfig'); // Import the database configuration

// Register user
exports.registerUser = (uid, name, email, adminId, role, callback) => {
  const query = 'INSERT INTO users (uid, name, email, adminId, role) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [uid, name, email, adminId, role], callback);
};

// Add admin
exports.addAdmin = (firstname, lastname, email, role, contact, callback) => {
  const query = 'INSERT INTO admins (firstname, lastname, email, role, contact) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [firstname, lastname, email, role, contact], callback);
};

// Get all admins
exports.getAllAdmins = (callback) => {
  const query = 'SELECT * FROM admins';
  db.query(query, callback);
};

// Get users added by the current admin
exports.getUsersByAdmin = (adminId, callback) => {
  const query = 'SELECT * FROM users WHERE adminId = ? AND deleted_at IS NULL';
  db.query(query, [adminId], callback);
};

// Update user
exports.updateUser = (uid, name, email, adminId, role, callback) => {
  const query = 'UPDATE users SET name = ?, email = ?, adminId = ?, role = ? WHERE uid = ?';
  db.query(query, [name, email, adminId, role, uid], callback);
};

// Soft delete user
exports.softDeleteUser = (uid, callback) => {
  const query = 'UPDATE users SET deleted_at = NOW() WHERE uid = ?';
  db.query(query, [uid], callback);
};

// Get user by email and check if not deleted
exports.getUserByEmail = (email, callback) => {
  const query = 'SELECT role, deleted_at FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
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