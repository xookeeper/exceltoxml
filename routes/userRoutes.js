const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import the user controller

// Register user
router.post('/register', userController.registerUser);

// Add admin
router.post('/addAdmin', userController.addAdmin);

// Get all admins
router.get('/admins', userController.getAllAdmins);

// Get users added by the current admin
router.get('/:adminId', userController.getUsersByAdmin);

// Update user
router.put('/updateUser', userController.updateUser);

// Soft delete user
router.put('/softDeleteUser/:uid', userController.softDeleteUser);

// Check user role
router.post('/checkRole', userController.checkUserRole);

module.exports = router;