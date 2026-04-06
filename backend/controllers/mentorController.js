const User = require('../models/User');
const FitnessLog = require('../models/FitnessLog');
const Goal = require('../models/Goal');

// Helper: verify this mentor is authorised to see this student
const verifyAssignment = async (mentorId, studentId) => {
  const mentor = await User.findById(mentorId).select('assignedStudents');
  if (!mentor) return false;
  return mentor.assignedStudents.map((id) => id.toString()).includes(studentId.toString());
};

// ─────────────────────────────────────────────────────────────
// @desc    Get assigned students (basic profile only – no raw logs)
// @route   GET /api/mentor/students
// @access  Private/Mentor
// ─────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id)
      .select('assignedStudents')
      .populate(
        'assignedStudents',
        'firstName lastName email studentId department year currentStreak points lastLogDate'
      );

    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    res.status(200).json({
      success: true,
      count: mentor.assignedStudents.length,
      data: mentor.assignedStudents,
    });
  } catch (err) {
    console.error('Error fetching assigned students:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a privacy-safe summary for one assigned student
//          Returns: wellness score weekly trend, streak, goal stats, consistency
//          Does NOT return: raw mood/stress/meal data
// @route   GET /api/mentor/student/:studentId/summary
// @access  Private/Mentor
// ─────────────────────────────────────────────────────────────
exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Gate: check mentor is assigned to this student
    const assigned = await verifyAssignment(req.user.id, studentId);
    if (!assigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this student',
      });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' }).select(
      'firstName lastName email studentId department year currentStreak points lastLogDate'
    );
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Last 7 days — aggregate daily wellness score (no raw fields)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTrend = await FitnessLog.find(
      { user: studentId, date: { $gte: sevenDaysAgo } },
      { date: 1, lifestyleScore: 1, steps: 1, activeMinutes: 1, 'sleep.hours': 1, _id: 0 }
    ).sort({ date: 1 });

    // Goal stats
    const totalGoals = await Goal.countDocuments({ user: studentId });
    const completedGoals = await Goal.countDocuments({ user: studentId, status: 'completed' });
    const activeGoals = await Goal.countDocuments({ user: studentId, status: 'active' });

    // Habit consistency: % of last 30 days with a log entry
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const logCountLast30 = await FitnessLog.countDocuments({
      user: studentId,
      date: { $gte: thirtyDaysAgo },
    });
    const consistencyPct = Math.round((logCountLast30 / 30) * 100);

    // Avg wellness score (last 30 days)
    const avgScoreResult = await FitnessLog.aggregate([
      { $match: { user: student._id, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, avg: { $avg: '$lifestyleScore' }, avgSteps: { $avg: '$steps' }, avgSleep: { $avg: '$sleep.hours' } } },
    ]);
    const avgWellness = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avg) : null;
    const avgSteps = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgSteps) : null;
    const avgSleep = avgScoreResult.length > 0 ? parseFloat((avgScoreResult[0].avgSleep || 0).toFixed(1)) : null;

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          department: student.department,
          year: student.year,
          currentStreak: student.currentStreak,
          points: student.points,
          lastLogDate: student.lastLogDate,
        },
        weeklyTrend,
        goals: { total: totalGoals, completed: completedGoals, active: activeGoals },
        consistency: consistencyPct,
        averages: { wellnessScore: avgWellness, steps: avgSteps, sleepHours: avgSleep },
      },
    });
  } catch (err) {
    console.error('Error fetching student summary:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Batch/department-level aggregate trends for assigned students
// @route   GET /api/mentor/batch-trends
// @access  Private/Mentor
// ─────────────────────────────────────────────────────────────
exports.getBatchTrends = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id).select('assignedStudents');
    if (!mentor || mentor.assignedStudents.length === 0) {
      return res.status(200).json({
        success: true,
        data: { byDepartment: [], overall: null },
      });
    }

    const studentIds = mentor.assignedStudents;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate by department (from the assigned cohort only)
    const byDepartment = await FitnessLog.aggregate([
      { $match: { user: { $in: studentIds }, date: { $gte: thirtyDaysAgo } } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.department',
          avgSleepHours: { $avg: '$sleep.hours' },
          avgSteps: { $avg: '$steps' },
          avgWellnessScore: { $avg: '$lifestyleScore' },
          studentCount: { $addToSet: '$user' },
          logCount: { $sum: 1 },
        },
      },
      {
        $project: {
          department: { $ifNull: ['$_id', 'Unknown'] },
          avgSleepHours: { $round: ['$avgSleepHours', 1] },
          avgSteps: { $round: ['$avgSteps', 0] },
          avgWellnessScore: { $round: ['$avgWellnessScore', 1] },
          studentCount: { $size: '$studentCount' },
          logCount: 1,
          _id: 0,
        },
      },
      { $sort: { avgWellnessScore: -1 } },
    ]);

    // Overall cohort averages
    const overallResult = await FitnessLog.aggregate([
      { $match: { user: { $in: studentIds }, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          avgSleepHours: { $avg: '$sleep.hours' },
          avgSteps: { $avg: '$steps' },
          avgWellnessScore: { $avg: '$lifestyleScore' },
        },
      },
    ]);

    const overall = overallResult.length > 0
      ? {
          avgSleepHours: parseFloat((overallResult[0].avgSleepHours || 0).toFixed(1)),
          avgSteps: Math.round(overallResult[0].avgSteps || 0),
          avgWellnessScore: parseFloat((overallResult[0].avgWellnessScore || 0).toFixed(1)),
        }
      : null;

    res.status(200).json({ success: true, data: { byDepartment, overall } });
  } catch (err) {
    console.error('Error fetching batch trends:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Anonymized top performers within assigned cohort
//          Returns rank, department, consistency %, streak — NO names
// @route   GET /api/mentor/top-performers
// @access  Private/Mentor
// ─────────────────────────────────────────────────────────────
exports.getTopPerformers = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id).select('assignedStudents');
    if (!mentor || mentor.assignedStudents.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const studentIds = mentor.assignedStudents;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count logs per student in last 30 days for consistency pct
    const logCounts = await FitnessLog.aggregate([
      { $match: { user: { $in: studentIds }, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$user', logCount: { $sum: 1 }, avgScore: { $avg: '$lifestyleScore' } } },
    ]);

    // Fetch only department + streak fields (no names for anonymity)
    const students = await User.find({ _id: { $in: studentIds } }).select(
      '_id department year currentStreak'
    );

    // Merge and rank
    const ranked = students
      .map((s) => {
        const logs = logCounts.find((l) => l._id.toString() === s._id.toString());
        const consistency = logs ? Math.round((logs.logCount / 30) * 100) : 0;
        const avgScore = logs ? Math.round(logs.avgScore) : 0;
        return {
          dept: s.department || 'Unknown',
          year: s.year || '—',
          streak: s.currentStreak || 0,
          consistency,
          avgWellnessScore: avgScore,
        };
      })
      .sort((a, b) => b.consistency - a.consistency || b.streak - a.streak);

    // Return only top 10%
    const topCount = Math.max(1, Math.ceil(ranked.length * 0.1));
    const top = ranked.slice(0, topCount).map((s, i) => ({ rank: i + 1, ...s }));

    res.status(200).json({ success: true, data: top });
  } catch (err) {
    console.error('Error fetching top performers:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Send a persistent encouragement message to an assigned student
// @route   POST /api/mentor/message/:studentId
// @access  Private/Mentor
// ─────────────────────────────────────────────────────────────
exports.sendEncouragementMessage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Gate: mentor must be assigned to this student
    const assigned = await verifyAssignment(req.user.id, studentId);
    if (!assigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this student',
      });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.encouragementMessages.push({
      from: req.user.id,
      message: message.trim(),
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Encouragement message sent!',
      data: student.encouragementMessages[student.encouragementMessages.length - 1],
    });
  } catch (err) {
    console.error('Error sending encouragement message:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Add coaching note to a fitness log (assigned student only)
// @route   POST /api/mentor/log/:logId/note
// @access  Private/Mentor
// ─────────────────────────────────────────────────────────────
exports.addMentorNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Please provide note content' });
    }

    const fitnessLog = await FitnessLog.findById(req.params.logId);
    if (!fitnessLog) {
      return res.status(404).json({ success: false, message: 'Fitness log not found' });
    }

    // Verify mentorship
    const assigned = await verifyAssignment(req.user.id, fitnessLog.user);
    if (!assigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this student' });
    }

    fitnessLog.mentorNotes.push({ mentor: req.user.id, content, date: new Date() });
    await fitnessLog.save();

    res.status(201).json({ success: true, message: 'Note added successfully', data: fitnessLog.mentorNotes });
  } catch (err) {
    console.error('Error adding mentor note:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
