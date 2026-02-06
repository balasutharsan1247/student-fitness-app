const express = require('express');
const {
  createGoal,
  getAllGoals,
  getActiveGoals,
  getCompletedGoals,
  getGoalById,
  updateGoal,
  updateProgress,
  completeGoal,
  abandonGoal,
  deleteGoal,
  getGoalStats,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== ALL ROUTES ARE PROTECTED ====================

// Get goal statistics
router.get('/stats', protect, getGoalStats);

// Get active goals
router.get('/active', protect, getActiveGoals);

// Get completed goals
router.get('/completed', protect, getCompletedGoals);

// Create goal and get all goals
router.route('/')
  .post(protect, createGoal)
  .get(protect, getAllGoals);

// Get, update, delete specific goal
router.route('/:id')
  .get(protect, getGoalById)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

// Update progress
router.put('/:id/progress', protect, updateProgress);

// Complete goal
router.put('/:id/complete', protect, completeGoal);

// Abandon goal
router.put('/:id/abandon', protect, abandonGoal);

module.exports = router;