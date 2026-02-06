const FitnessLog = require('../models/FitnessLog');
const User = require('../models/User');

// ==================== CREATE FITNESS LOG ====================

// @desc    Create or update today's fitness log
// @route   POST /api/fitness/log
// @access  Private
exports.createOrUpdateLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      date,
      steps,
      distance,
      activeMinutes,
      caloriesBurned,
      workouts,
      sleep,
      meals,
      totalCaloriesConsumed,
      waterIntake,
      screenTime,
      stressLevel,
      stressFactors,
      mood,
      weight,
      notes,
    } = req.body;

    // Use provided date or default to today
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0); // Set to start of day

    // Check if log already exists for this date
    let fitnessLog = await FitnessLog.findOne({
      user: userId,
      date: logDate,
    });

    if (fitnessLog) {
      // Update existing log
      fitnessLog.steps = steps !== undefined ? steps : fitnessLog.steps;
      fitnessLog.distance = distance !== undefined ? distance : fitnessLog.distance;
      fitnessLog.activeMinutes = activeMinutes !== undefined ? activeMinutes : fitnessLog.activeMinutes;
      fitnessLog.caloriesBurned = caloriesBurned !== undefined ? caloriesBurned : fitnessLog.caloriesBurned;
      fitnessLog.workouts = workouts !== undefined ? workouts : fitnessLog.workouts;
      fitnessLog.sleep = sleep !== undefined ? sleep : fitnessLog.sleep;
      fitnessLog.meals = meals !== undefined ? meals : fitnessLog.meals;
      fitnessLog.totalCaloriesConsumed = totalCaloriesConsumed !== undefined ? totalCaloriesConsumed : fitnessLog.totalCaloriesConsumed;
      fitnessLog.waterIntake = waterIntake !== undefined ? waterIntake : fitnessLog.waterIntake;
      fitnessLog.screenTime = screenTime !== undefined ? screenTime : fitnessLog.screenTime;
      fitnessLog.stressLevel = stressLevel !== undefined ? stressLevel : fitnessLog.stressLevel;
      fitnessLog.stressFactors = stressFactors !== undefined ? stressFactors : fitnessLog.stressFactors;
      fitnessLog.mood = mood !== undefined ? mood : fitnessLog.mood;
      fitnessLog.weight = weight !== undefined ? weight : fitnessLog.weight;
      fitnessLog.notes = notes !== undefined ? notes : fitnessLog.notes;

      // Calculate lifestyle score
      fitnessLog.calculateLifestyleScore();

      await fitnessLog.save();

      res.status(200).json({
        success: true,
        message: 'Fitness log updated successfully',
        data: fitnessLog,
      });
    } else {
      // Create new log
      fitnessLog = await FitnessLog.create({
        user: userId,
        date: logDate,
        steps,
        distance,
        activeMinutes,
        caloriesBurned,
        workouts,
        sleep,
        meals,
        totalCaloriesConsumed,
        waterIntake,
        screenTime,
        stressLevel,
        stressFactors,
        mood,
        weight,
        notes,
      });

      // Calculate lifestyle score
      fitnessLog.calculateLifestyleScore();
      await fitnessLog.save();

      res.status(201).json({
        success: true,
        message: 'Fitness log created successfully',
        data: fitnessLog,
      });
    }
  } catch (error) {
    console.error('Create/Update Log Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating/updating fitness log',
      error: error.message,
    });
  }
};

// ==================== GET FITNESS LOGS ====================

// @desc    Get today's fitness log
// @route   GET /api/fitness/log/today
// @access  Private
exports.getTodayLog = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const fitnessLog = await FitnessLog.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!fitnessLog) {
      return res.status(404).json({
        success: false,
        message: 'No fitness log found for today',
      });
    }

    res.status(200).json({
      success: true,
      data: fitnessLog,
    });
  } catch (error) {
    console.error('Get Today Log Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s log',
      error: error.message,
    });
  }
};

// @desc    Get fitness log by specific date
// @route   GET /api/fitness/log/date/:date
// @access  Private
exports.getLogByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Parse and validate date
    const logDate = new Date(date);
    if (isNaN(logDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    logDate.setHours(0, 0, 0, 0);

    const fitnessLog = await FitnessLog.findOne({
      user: userId,
      date: logDate,
    });

    if (!fitnessLog) {
      return res.status(404).json({
        success: false,
        message: `No fitness log found for ${date}`,
      });
    }

    res.status(200).json({
      success: true,
      data: fitnessLog,
    });
  } catch (error) {
    console.error('Get Log By Date Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching log',
      error: error.message,
    });
  }
};

// @desc    Get fitness logs for a date range
// @route   GET /api/fitness/log/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private
exports.getLogsByDateRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both startDate and endDate',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const fitnessLogs = await FitnessLog.find({
      user: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 }); // Sort by date descending (newest first)

    res.status(200).json({
      success: true,
      count: fitnessLogs.length,
      data: fitnessLogs,
    });
  } catch (error) {
    console.error('Get Logs By Range Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching logs',
      error: error.message,
    });
  }
};

// @desc    Get all fitness logs for current user
// @route   GET /api/fitness/log/all
// @access  Private
exports.getAllLogs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const fitnessLogs = await FitnessLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    const total = await FitnessLog.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: fitnessLogs.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
      data: fitnessLogs,
    });
  } catch (error) {
    console.error('Get All Logs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching logs',
      error: error.message,
    });
  }
};

// ==================== UPDATE FITNESS LOG ====================

// @desc    Update fitness log by ID
// @route   PUT /api/fitness/log/:id
// @access  Private
exports.updateLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = req.params.id;

    let fitnessLog = await FitnessLog.findById(logId);

    if (!fitnessLog) {
      return res.status(404).json({
        success: false,
        message: 'Fitness log not found',
      });
    }

    // Make sure user owns this log
    if (fitnessLog.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this log',
      });
    }

    // Update fields
    const updateFields = { ...req.body };
    delete updateFields.user; // Don't allow changing the owner

    Object.keys(updateFields).forEach((key) => {
      fitnessLog[key] = updateFields[key];
    });

    // Recalculate lifestyle score
    fitnessLog.calculateLifestyleScore();

    await fitnessLog.save();

    res.status(200).json({
      success: true,
      message: 'Fitness log updated successfully',
      data: fitnessLog,
    });
  } catch (error) {
    console.error('Update Log Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating log',
      error: error.message,
    });
  }
};

// ==================== DELETE FITNESS LOG ====================

// @desc    Delete fitness log by ID
// @route   DELETE /api/fitness/log/:id
// @access  Private
exports.deleteLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = req.params.id;

    const fitnessLog = await FitnessLog.findById(logId);

    if (!fitnessLog) {
      return res.status(404).json({
        success: false,
        message: 'Fitness log not found',
      });
    }

    // Make sure user owns this log
    if (fitnessLog.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this log',
      });
    }

    await fitnessLog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fitness log deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete Log Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting log',
      error: error.message,
    });
  }
};

// ==================== STATISTICS ====================

// @desc    Get weekly statistics
// @route   GET /api/fitness/stats/week
// @access  Private
exports.getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get last 7 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const logs = await FitnessLog.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      totalDays: logs.length,
      averageSteps: 0,
      totalSteps: 0,
      averageCaloriesBurned: 0,
      totalCaloriesBurned: 0,
      averageActiveMinutes: 0,
      totalActiveMinutes: 0,
      averageWaterIntake: 0,
      averageSleepHours: 0,
      averageLifestyleScore: 0,
      workoutDays: 0,
      dailyData: [],
    };

    if (logs.length > 0) {
      logs.forEach((log) => {
        stats.totalSteps += log.steps || 0;
        stats.totalCaloriesBurned += log.caloriesBurned || 0;
        stats.totalActiveMinutes += log.activeMinutes || 0;
        stats.averageWaterIntake += log.waterIntake || 0;
        stats.averageSleepHours += log.sleep?.hours || 0;
        stats.averageLifestyleScore += log.lifestyleScore || 0;
        
        if (log.workouts && log.workouts.length > 0) {
          stats.workoutDays++;
        }

        stats.dailyData.push({
          date: log.date,
          steps: log.steps,
          caloriesBurned: log.caloriesBurned,
          activeMinutes: log.activeMinutes,
          lifestyleScore: log.lifestyleScore,
          workouts: log.workouts?.length || 0,
        });
      });

      stats.averageSteps = Math.round(stats.totalSteps / logs.length);
      stats.averageCaloriesBurned = Math.round(stats.totalCaloriesBurned / logs.length);
      stats.averageActiveMinutes = Math.round(stats.totalActiveMinutes / logs.length);
      stats.averageWaterIntake = parseFloat((stats.averageWaterIntake / logs.length).toFixed(2));
      stats.averageSleepHours = parseFloat((stats.averageSleepHours / logs.length).toFixed(1));
      stats.averageLifestyleScore = Math.round(stats.averageLifestyleScore / logs.length);
    }

    res.status(200).json({
      success: true,
      period: {
        startDate: startDate,
        endDate: endDate,
      },
      data: stats,
    });
  } catch (error) {
    console.error('Get Weekly Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message,
    });
  }
};

// @desc    Get monthly statistics
// @route   GET /api/fitness/stats/month
// @access  Private
exports.getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get last 30 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const logs = await FitnessLog.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate statistics (similar to weekly but for 30 days)
    const stats = {
      totalDays: logs.length,
      averageSteps: 0,
      totalSteps: 0,
      averageCaloriesBurned: 0,
      totalCaloriesBurned: 0,
      averageActiveMinutes: 0,
      totalActiveMinutes: 0,
      averageWaterIntake: 0,
      averageSleepHours: 0,
      averageLifestyleScore: 0,
      workoutDays: 0,
      bestDay: null,
      worstDay: null,
    };

    if (logs.length > 0) {
      let highestScore = -1;
      let lowestScore = 101;

      logs.forEach((log) => {
        stats.totalSteps += log.steps || 0;
        stats.totalCaloriesBurned += log.caloriesBurned || 0;
        stats.totalActiveMinutes += log.activeMinutes || 0;
        stats.averageWaterIntake += log.waterIntake || 0;
        stats.averageSleepHours += log.sleep?.hours || 0;
        stats.averageLifestyleScore += log.lifestyleScore || 0;
        
        if (log.workouts && log.workouts.length > 0) {
          stats.workoutDays++;
        }

        // Track best and worst days
        if (log.lifestyleScore > highestScore) {
          highestScore = log.lifestyleScore;
          stats.bestDay = {
            date: log.date,
            score: log.lifestyleScore,
          };
        }

        if (log.lifestyleScore < lowestScore && log.lifestyleScore > 0) {
          lowestScore = log.lifestyleScore;
          stats.worstDay = {
            date: log.date,
            score: log.lifestyleScore,
          };
        }
      });

      stats.averageSteps = Math.round(stats.totalSteps / logs.length);
      stats.averageCaloriesBurned = Math.round(stats.totalCaloriesBurned / logs.length);
      stats.averageActiveMinutes = Math.round(stats.totalActiveMinutes / logs.length);
      stats.averageWaterIntake = parseFloat((stats.averageWaterIntake / logs.length).toFixed(2));
      stats.averageSleepHours = parseFloat((stats.averageSleepHours / logs.length).toFixed(1));
      stats.averageLifestyleScore = Math.round(stats.averageLifestyleScore / logs.length);
    }

    res.status(200).json({
      success: true,
      period: {
        startDate: startDate,
        endDate: endDate,
      },
      data: stats,
    });
  } catch (error) {
    console.error('Get Monthly Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message,
    });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/fitness/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Get today's log
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLog = await FitnessLog.findOne({
      user: userId,
      date: { $gte: today },
    });

    // Get last 7 days for trend
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weekLogs = await FitnessLog.find({
      user: userId,
      date: { $gte: weekAgo },
    }).sort({ date: 1 });

    // Calculate week average
    let weekAverageScore = 0;
    if (weekLogs.length > 0) {
      const totalScore = weekLogs.reduce((sum, log) => sum + (log.lifestyleScore || 0), 0);
      weekAverageScore = Math.round(totalScore / weekLogs.length);
    }

    // Build dashboard data
    const dashboard = {
      user: {
        name: `${user.firstName} ${user.lastName}`,
        level: user.level,
        points: user.points,
        badges: user.badges,
      },
      today: todayLog ? {
        steps: todayLog.steps,
        stepsGoal: user.targetSteps,
        stepsProgress: Math.round((todayLog.steps / user.targetSteps) * 100),
        caloriesBurned: todayLog.caloriesBurned,
        activeMinutes: todayLog.activeMinutes,
        waterIntake: todayLog.waterIntake,
        sleepHours: todayLog.sleep?.hours,
        lifestyleScore: todayLog.lifestyleScore,
        workouts: todayLog.workouts?.length || 0,
        mood: todayLog.mood,
      } : null,
      weekSummary: {
        averageScore: weekAverageScore,
        activeDays: weekLogs.length,
        trend: weekLogs.map(log => ({
          date: log.date,
          score: log.lifestyleScore,
        })),
      },
    };

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Get Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard',
      error: error.message,
    });
  }
};