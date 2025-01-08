const userRepository = require('../repositories/userRepository'); // Import the user repository

// Register user
exports.registerUser = (req, res) => {
  const { uid, name, email, adminId, role } = req.body;

  userRepository.registerUser(uid, name, email, adminId, role, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
};

// Add admin
exports.addAdmin = (req, res) => {
  const { firstname, lastname, email, role, contact } = req.body;

  userRepository.addAdmin(firstname, lastname, email, role, contact, (err, result) => {
    if (err) {
      console.error('Error inserting admin:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Admin added successfully' });
  });
};

// Get all admins
exports.getAllAdmins = (req, res) => {
  userRepository.getAllAdmins((err, results) => {
    if (err) {
      console.error('Error fetching admins:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
};

// Get users added by the current admin
exports.getUsersByAdmin = (req, res) => {
  const { adminId } = req.params;

  userRepository.getUsersByAdmin(adminId, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
};

// Update user
exports.updateUser = (req, res) => {
  const { uid, name, email, adminId, role } = req.body;

  userRepository.updateUser(uid, name, email, adminId, role, (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
};

// Soft delete user
exports.softDeleteUser = (req, res) => {
  const { uid } = req.params;

  userRepository.softDeleteUser(uid, (err, result) => {
    if (err) {
      console.error('Error soft deleting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'User soft deleted successfully' });
  });
};

// Check user role
exports.checkUserRole = (req, res) => {
  const { email } = req.body;

  userRepository.getUserByEmail(email, (err, result) => {
    if (err) {
      console.error('Error fetching user role:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
};