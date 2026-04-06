const User = require('../models/User');

// @desc    Get Campus Leaderboards (Top 10 by Points and Streaks)
// @route   GET /api/leaderboard
// @access  Private (all logged in users can view)
exports.getLeaderboard = async (req, res) => {
  try {
    // Top 10 by Consistency Streak
    const topStreaks = await User.find({ role: 'student', currentStreak: { $gt: 0 } })
      .select('firstName lastName currentStreak points')
      .sort({ currentStreak: -1, points: -1 })
      .limit(10);

    // Top 10 by Total Points
    const topPoints = await User.find({ role: 'student', points: { $gt: 0 } })
      .select('firstName lastName currentStreak points')
      .sort({ points: -1, currentStreak: -1 })
      .limit(10);

    // Format the response to ensure privacy (only first name and initial of last name)
    const formatUser = (user) => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName.charAt(0)}.`,
      streak: user.currentStreak,
      points: user.points
    });

    res.status(200).json({
      success: true,
      data: {
        topStreaks: topStreaks.map(formatUser),
        topPoints: topPoints.map(formatUser)
      }
    });
  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch leaderboards'
    });
  }
};
