const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get the Campus Leaderboard top 10 rankings (All authenticated users can view)
router.route('/').get(protect, getLeaderboard);

module.exports = router;
