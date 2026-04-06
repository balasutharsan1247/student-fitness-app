const Goal = require('../models/Goal');
const User = require('../models/User');

// ==================== CREATE GOAL ====================

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      category,
      targetValue,
      currentValue,
      unit,
      startDate,
      targetDate,
      motivationQuote,
      rewards,
      milestones,
      reminderEnabled,
      reminderFrequency,
      metricType,
      goalMode,
      verificationType,
    } = req.body;

    // Validate target date is in the future
    if (targetDate && new Date(targetDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be in the future',
      });
    }

    // Create goal
    const currentVal = currentValue !== undefined ? currentValue : 0;
    const resolvedVerificationType =
      verificationType === 'confirmable' ? 'confirmable' : 'auto_verifiable';
    const isAutoTracked = resolvedVerificationType === 'auto_verifiable';

    const goal = await Goal.create({
      user: userId,
      title,
      description,
      category,
      targetValue,
      metricType,
      goalMode,
      isAutoTracked,
      verificationType: resolvedVerificationType,
      currentValue: currentVal,
      startingValue: currentVal,  // ✅ Set startingValue explicitly!
      unit,
      startDate: startDate || Date.now(),
      targetDate,
      motivationQuote,
      rewards,
      milestones,
      reminderEnabled,
      reminderFrequency,
    });

    // Calculate initial progress
    goal.calculateProgress();
    await goal.save();

    // Check if auto-completed upon creation (e.g. targetValue = 0)
    if (goal.status === 'Completed') {
      const user = await User.findById(userId);
      user.points = (user.points || 0) + goal.points;
      user.level = Math.floor(user.points / 500) + 1;

      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Create Goal Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating goal',
      error: error.message,
    });
  }
};

// ==================== GET GOALS ====================

// @desc    Get all goals for current user
// @route   GET /api/goals
// @access  Private
exports.getAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category } = req.query;

    // Build filter
    const filter = { user: userId };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error('Get All Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goals',
      error: error.message,
    });
  }
};

// @desc    Get active goals
// @route   GET /api/goals/active
// @access  Private
exports.getActiveGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({
      user: userId,
      status: { $in: ['Not Started', 'In Progress'] },
    }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error('Get Active Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active goals',
      error: error.message,
    });
  }
};

// @desc    Get completed goals
// @route   GET /api/goals/completed
// @access  Private
exports.getCompletedGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({
      user: userId,
      status: 'Completed',
    }).sort({ completedDate: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error('Get Completed Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching completed goals',
      error: error.message,
    });
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private
exports.getGoalById = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user owns this goal
    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this goal',
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Get Goal By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goal',
      error: error.message,
    });
  }
};

// ==================== UPDATE GOAL ====================

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    let goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user owns this goal
    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal',
      });
    }

    // Update fields
    const allowedUpdates = [
      'title',
      'description',
      'category',
      'targetValue',
      'currentValue',
      'unit',
      'targetDate',
      'status',
      'motivationQuote',
      'rewards',
      'milestones',
      'reminderEnabled',
      'reminderFrequency',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    // Recalculate progress
    goal.calculateProgress();

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Update Goal Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating goal',
      error: error.message,
    });
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { currentValue, addToValue } = req.body;

    let goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user owns this goal
    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal',
      });
    }

    if (goal.verificationType === 'auto_verifiable' || goal.isAutoTracked) {
      return res.status(400).json({
        success: false,
        message:
          'Auto-tracked goals cannot be manually progressed. Log activity instead.',
      });
    }

    // Update current value
    if (addToValue !== undefined) {
      goal.currentValue = (goal.currentValue || 0) + addToValue;
    } else if (currentValue !== undefined) {
      goal.currentValue = currentValue;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either currentValue or addToValue',
      });
    }

    // Track previous status to prevent double-awarding points
    const previousStatus = goal.status;

    // Recalculate progress
    goal.calculateProgress();

    // Check if NEWLY auto-completed
    const wasCompleted = goal.status === 'Completed' && previousStatus !== 'Completed';

    await goal.save();

    // Award points and update user if completed
    if (wasCompleted) {
      const user = await User.findById(userId);
      const pointsForCompletion = goal.verificationType === 'confirmable' ? 12 : 20;
      goal.points = pointsForCompletion;
      await goal.save();

      user.points = (user.points || 0) + pointsForCompletion;
      user.level = Math.floor(user.points / 500) + 1;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Goal auto-completed! Progress updated and points awarded.',
        data: goal,
        pointsAwarded: pointsForCompletion,
        totalPoints: user.points,
        level: user.level,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Update Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress',
      error: error.message,
    });
  }
};

// @desc    Mark goal as completed
// @route   PUT /api/goals/:id/complete
// @access  Private
exports.completeGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { completionEvidenceNote } = req.body;

    let goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user owns this goal
    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this goal',
      });
    }

    // Check if already completed
    if (goal.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Goal is already completed',
      });
    }

    if (goal.verificationType === 'auto_verifiable' || goal.isAutoTracked) {
      return res.status(400).json({
        success: false,
        message:
          'Auto-tracked goals are completed only from verified activity logs.',
      });
    }

    if (!completionEvidenceNote || !completionEvidenceNote.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please add a short completion note for confirmable goals.',
      });
    }

    // Mark as completed
    goal.status = 'Completed';
    goal.completedDate = Date.now();
    goal.progress = 100;
    goal.currentValue = goal.targetValue;
    goal.completionMethod = 'self_confirmed';
    goal.completionEvidenceNote = completionEvidenceNote.trim();

    // Confirmable goal reward (simple and defensible)
    const pointsBreakdown = calculatePointsBreakdown(goal);
    goal.points = pointsBreakdown.total;

    await goal.save();

    // Update user points
    const user = await User.findById(userId);
    const previousPoints = user.points || 0;

    user.points = previousPoints + goal.points;
    user.level = Math.floor(user.points / 500) + 1;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Goal completed! Points awarded.',
      data: {
        goal: goal,
        pointsAwarded: goal.points,
        previousPoints: previousPoints,
        totalPoints: user.points,
        level: user.level,
        pointsBreakdown: pointsBreakdown,
      },
    });
  } catch (error) {
    console.error('Complete Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing goal',
      error: error.message,
    });
  }
};

// Helper function to calculate points breakdown
function calculatePointsBreakdown(goal) {
  const breakdown = {
    base: goal.verificationType === 'confirmable' ? 12 : 20,
    total: 0,
    details: [],
  };

  breakdown.details.push({
    label:
      goal.verificationType === 'confirmable'
        ? 'Confirmable Goal Reward'
        : 'Auto-verifiable Goal Reward',
    value: breakdown.base,
  });
  breakdown.total = breakdown.base;

  return breakdown;
}

// @desc    Mark goal as abandoned
// @route   PUT /api/goals/:id/abandon
// @access  Private
exports.abandonGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    let goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user owns this goal
    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to abandon this goal',
      });
    }

    goal.status = 'Abandoned';
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal marked as abandoned',
      data: goal,
    });
  } catch (error) {
    console.error('Abandon Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while abandoning goal',
      error: error.message,
    });
  }
};

// ==================== DELETE GOAL ====================

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    console.log('🗑️ DELETE REQUEST');
    console.log('User ID:', userId);
    console.log('Goal ID:', goalId);

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // Make sure user owns this goal
    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal',
      });
    }

    console.log('📊 Goal details:');
    console.log('Status:', goal.status);
    console.log('Points:', goal.points);

    // Check if goal was completed and had points
    const wasCompleted = goal.status === 'Completed';
    const pointsToDeduct = wasCompleted ? goal.points : 0;

    console.log('Was completed?', wasCompleted);
    console.log('Points to deduct:', pointsToDeduct);

    // Delete the goal FIRST
    await goal.deleteOne();
    console.log('✅ Goal deleted from database');

    // If goal was completed, deduct points
    if (wasCompleted && pointsToDeduct > 0) {
      const user = await User.findById(userId);
      const previousPoints = user.points || 0;

      // Deduct points (don't go below 0)
      user.points = Math.max(0, previousPoints - pointsToDeduct);
      user.level = Math.floor(user.points / 500) + 1;

      await user.save();
      console.log('✅ User saved to database');

      return res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
        data: {
          pointsDeducted: pointsToDeduct,
          previousPoints: previousPoints,
          newPoints: user.points,
          newLevel: user.level,
          user: {
            points: user.points,
            level: user.level,
          },
        },
      });
    }

    console.log('✅ Goal deleted (no points to deduct)');

    // If goal wasn't completed, just return success
    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('❌ Delete Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting goal',
      error: error.message,
    });
  }
};

// ==================== STATISTICS ====================

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
exports.getGoalStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ user: userId });

    const stats = {
      total: goals.length,
      active: 0,
      completed: 0,
      abandoned: 0,
      notStarted: 0,
      inProgress: 0,
      averageProgress: 0,
      totalPointsEarned: 0,
      completionRate: 0,
      upcomingDeadlines: [],
      overdueGoals: [],
      categoryCounts: {},
    };

    if (goals.length > 0) {
      let totalProgress = 0;

      goals.forEach((goal) => {
        // Count by status
        if (goal.status === 'Completed') stats.completed++;
        else if (goal.status === 'Abandoned') stats.abandoned++;
        else if (goal.status === 'Not Started') stats.notStarted++;
        else if (goal.status === 'In Progress') stats.inProgress++;

        // Active goals
        if (goal.status === 'In Progress' || goal.status === 'Not Started') {
          stats.active++;
        }

        // Total progress
        totalProgress += goal.progress;

        // Total points
        stats.totalPointsEarned += goal.points;

        // Category counts
        if (stats.categoryCounts[goal.category]) {
          stats.categoryCounts[goal.category]++;
        } else {
          stats.categoryCounts[goal.category] = 1;
        }

        // Upcoming deadlines (next 7 days)
        const daysRemaining = goal.getDaysRemaining();
        if (
          daysRemaining >= 0 &&
          daysRemaining <= 7 &&
          goal.status !== 'Completed'
        ) {
          stats.upcomingDeadlines.push({
            goalId: goal._id,
            title: goal.title,
            daysRemaining: daysRemaining,
            targetDate: goal.targetDate,
          });
        }

        // Overdue goals
        if (goal.isOverdue()) {
          stats.overdueGoals.push({
            goalId: goal._id,
            title: goal.title,
            daysOverdue: Math.abs(daysRemaining),
            targetDate: goal.targetDate,
          });
        }
      });

      stats.averageProgress = Math.round(totalProgress / goals.length);
      stats.completionRate =
        goals.length > 0 ? Math.round((stats.completed / goals.length) * 100) : 0;

      // Sort upcoming deadlines by days remaining
      stats.upcomingDeadlines.sort(
        (a, b) => a.daysRemaining - b.daysRemaining
      );
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get Goal Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goal statistics',
      error: error.message,
    });
  }
};