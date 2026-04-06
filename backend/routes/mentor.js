const express = require('express');
const {
  getStudents,
  getStudentSummary,
  getBatchTrends,
  getTopPerformers,
  sendEncouragementMessage,
  addMentorNote,
} = require('../controllers/mentorController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Protect all routes — mentor and admin only
router.use(protect);
router.use(authorize('mentor', 'admin'));

// Get all assigned students (basic profile, no raw logs)
router.get('/students', getStudents);

// Privacy-safe student summary (wellness trend, goals, consistency — no raw data)
router.get('/student/:studentId/summary', getStudentSummary);

// Department-level batch aggregate trends for the mentor's assigned cohort
router.get('/batch-trends', getBatchTrends);

// Anonymized top 10% performers (no names, rank by consistency)
router.get('/top-performers', getTopPerformers);

// Send persistent encouragement message to an assigned student
router.post('/message/:studentId', sendEncouragementMessage);

// Add coaching note to a specific fitness log (assigned student only)
router.post('/log/:logId/note', addMentorNote);

module.exports = router;
