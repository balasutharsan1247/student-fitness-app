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

    const goal = await Goal.create({
      user: userId,
      title,
      description,
      category,
      targetValue,
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

    // Recalculate progress
    goal.calculateProgress();

    // Check if auto-completed
    const wasCompleted = goal.status === 'Completed';

    await goal.save();

    // Award points and update user if completed
    if (wasCompleted) {
      const user = await User.findById(userId);
      const previousPoints = user.points || 0;
      const previousLevel = user.level || 1;

      user.points += goal.points;
      const newLevel = Math.floor(user.points / 500) + 1;
      user.level = newLevel;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Goal auto-completed! Progress updated and points awarded.',
        data: goal,
        pointsAwarded: goal.points,
        totalPoints: user.points,
        levelUp:
          newLevel > previousLevel
            ? {
                previousLevel,
                newLevel,
                message: `🎉 Level Up! You're now Level ${newLevel}!`,
              }
            : null,
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

    // Mark as completed
    goal.status = 'Completed';
    goal.completedDate = Date.now();
    goal.progress = 100;
    goal.currentValue = goal.targetValue;

    // Calculate points with bonuses
    const pointsBreakdown = calculatePointsBreakdown(goal);
    goal.points = pointsBreakdown.total;

    await goal.save();

    // Update user points and level
    const user = await User.findById(userId);
    const previousPoints = user.points || 0;
    const previousLevel = user.level || 1;

    user.points = previousPoints + goal.points;

    // Calculate new level
    const newLevel = Math.floor(user.points / 500) + 1;
    user.level = newLevel;

    // Award badge if special milestone
    if (goal.badge) {
      if (!user.badges.includes(goal.badge)) {
        user.badges.push(goal.badge);
      }
    }

    await user.save();

    // Check if leveled up
    const leveledUp = newLevel > previousLevel;

    res.status(200).json({
      success: true,
      message: 'Goal completed! Points awarded.',
      data: {
        goal: goal,
        pointsAwarded: goal.points,
        previousPoints: previousPoints,
        totalPoints: user.points,
        pointsBreakdown: pointsBreakdown,
        levelUp: leveledUp
          ? {
              previousLevel,
              newLevel,
              message: `🎉 Level Up! You're now Level ${newLevel}!`,
            }
          : null,
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
    base: 100,
    earlyCompletion: 0,
    categoryBonus: 0,
    progressBonus: 0,
    commitmentBonus: 0,
    milestoneBonus: 0,
    total: 0,
    details: [],
  };

  breakdown.details.push({ label: 'Base Points', value: 100 });

  // BONUS 1: Early Completion
  if (goal.targetDate && goal.completedDate) {
    const deadline = new Date(goal.targetDate);
    const completed = new Date(goal.completedDate);

    if (completed < deadline) {
      const daysEarly = Math.ceil(
        (deadline - completed) / (1000 * 60 * 60 * 24)
      );

      if (daysEarly >= 7) {
        breakdown.earlyCompletion = 50;
        breakdown.details.push({
          label: 'Early Completion (1+ week)',
          value: 50,
        });
      } else if (daysEarly >= 3) {
        breakdown.earlyCompletion = 30;
        breakdown.details.push({
          label: 'Early Completion (3-6 days)',
          value: 30,
        });
      } else if (daysEarly >= 1) {
        breakdown.earlyCompletion = 20;
        breakdown.details.push({
          label: 'Early Completion (1-2 days)',
          value: 20,
        });
      }
    }
  }

  // BONUS 2: Category Difficulty
  const categoryBonuses = {
    'Weight Loss': 50,
    'Weight Gain': 50,
    'Muscle Building': 45,
    'Cardio': 40,
    'Flexibility': 30,
    'Sleep': 35,
    'Nutrition': 30,
    'Hydration': 25,
    'Steps': 25,
    'Stress Management': 40,
    'General Fitness': 20,
    'Other': 15,
  };

  breakdown.categoryBonus = categoryBonuses[goal.category] || 15;
  breakdown.details.push({
    label: `${goal.category} Category`,
    value: breakdown.categoryBonus,
  });

  // BONUS 3: Progress Achievement
  const startValue = goal.startingValue || 0;
  const progressMade = goal.currentValue - startValue;
  const targetRange = Math.abs(goal.targetValue - startValue);

  if (targetRange > 0) {
    const progressPercent = (Math.abs(progressMade) / targetRange) * 100;
    if (progressPercent >= 100) {
      breakdown.progressBonus = 25;
      breakdown.details.push({ label: 'Target Achieved', value: 25 });
    }
  }

  // BONUS 4: Commitment Duration
  if (goal.startDate && goal.completedDate) {
    const duration = Math.ceil(
      (new Date(goal.completedDate) - new Date(goal.startDate)) /
        (1000 * 60 * 60 * 24)
    );

    if (duration >= 60) {
      breakdown.commitmentBonus = 40;
      breakdown.details.push({
        label: 'Long-term Commitment (60+ days)',
        value: 40,
      });
    } else if (duration >= 30) {
      breakdown.commitmentBonus = 25;
      breakdown.details.push({ label: 'Commitment (30+ days)', value: 25 });
    } else if (duration >= 14) {
      breakdown.commitmentBonus = 15;
      breakdown.details.push({ label: 'Commitment (14+ days)', value: 15 });
    }
  }

  // BONUS 5: Milestones
  if (goal.milestones && goal.milestones.length > 0) {
    const achievedMilestones = goal.milestones.filter((m) => m.achieved).length;
    if (achievedMilestones > 0) {
      breakdown.milestoneBonus = achievedMilestones * 10;
      breakdown.details.push({
        label: `Milestones (${achievedMilestones})`,
        value: breakdown.milestoneBonus,
      });
    }
  }

  // Calculate total
  breakdown.total =
    breakdown.base +
    breakdown.earlyCompletion +
    breakdown.categoryBonus +
    breakdown.progressBonus +
    breakdown.commitmentBonus +
    breakdown.milestoneBonus;

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

    // Check if goal was completed and had points
    const wasCompleted = goal.status === 'Completed';
    const pointsToDeduct = wasCompleted ? goal.points : 0;

    // Delete the goal
    await goal.deleteOne();

    // If goal was completed, deduct points and recalculate level
    if (wasCompleted && pointsToDeduct > 0) {
      const user = await User.findById(userId);
      const previousPoints = user.points || 0;
      const previousLevel = user.level || 1;

      // Deduct points (don't go below 0)
      user.points = Math.max(0, previousPoints - pointsToDeduct);

      // Recalculate level
      const newLevel = Math.floor(user.points / 500) + 1;
      user.level = newLevel;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
        data: {
          pointsDeducted: pointsToDeduct,
          previousPoints: previousPoints,
          newPoints: user.points,
          levelChanged: newLevel !== previousLevel,
          previousLevel: previousLevel,
          newLevel: newLevel,
          user: {
            points: user.points,
            level: user.level,
          },
        },
      });
    }

    // If goal wasn't completed, just return success
    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete Goal Error:', error);
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