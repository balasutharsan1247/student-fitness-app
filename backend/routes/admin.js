const express = require('express');
const {
  getAggregateStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMentors,
  assignStudents,
  unassignStudent,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect);

// Admin / Mentor Dashboard (Aggregate stats)
router.get('/aggregate-stats', getAggregateStats);

// User role management (admin only)
router.get('/users', authorize('admin'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.put('/users/:userId', authorize('admin'), updateUser);
router.delete('/users/:userId', authorize('admin'), deleteUser);

// Mentor assignment management (admin only)
router.get('/mentors', authorize('admin'), getMentors);
router.put('/mentors/:mentorId/assign', authorize('admin'), assignStudents);
router.delete('/mentors/:mentorId/students/:studentId', authorize('admin'), unassignStudent);

module.exports = router;
