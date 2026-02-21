const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  recalculateLevel,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Create router
const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Anyone can access these without being logged in

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// ==================== PROTECTED ROUTES ====================
// Must be logged in to access these

// Get current user profile
router.get('/me', protect, getMe);

// Update user profile
router.put('/updateprofile', protect, updateProfile);

// Update password
router.put('/updatepassword', protect, updatePassword);

// Recalculate level
router.put('/recalculate-level', protect, recalculateLevel);

// Export router
module.exports = router;