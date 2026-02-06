const express = require('express');
const {
  createOrUpdateLog,
  getTodayLog,
  getLogByDate,
  getLogsByDateRange,
  getAllLogs,
  updateLog,
  deleteLog,
  getWeeklyStats,
  getMonthlyStats,
  getDashboard,
} = require('../controllers/fitnessLogController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ==================== ALL ROUTES ARE PROTECTED ====================
// All fitness log routes require authentication

// Create or update fitness log
router.post('/log', protect, createOrUpdateLog);

// Get today's log
router.get('/log/today', protect, getTodayLog);

// Get log by specific date
router.get('/log/date/:date', protect, getLogByDate);

// Get logs by date range
router.get('/log/range', protect, getLogsByDateRange);

// Get all logs (with pagination)
router.get('/log/all', protect, getAllLogs);

// Update log by ID
router.put('/log/:id', protect, updateLog);

// Delete log by ID
router.delete('/log/:id', protect, deleteLog);

// Get weekly statistics
router.get('/stats/week', protect, getWeeklyStats);

// Get monthly statistics
router.get('/stats/month', protect, getMonthlyStats);

// Get dashboard summary
router.get('/dashboard', protect, getDashboard);

module.exports = router;