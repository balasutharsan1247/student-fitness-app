const mongoose = require('mongoose');

// Define the FitnessLog Schema
const fitnessLogSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this log
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: [true, 'Fitness log must belong to a user'],
    },

    // Date of the log
    date: {
      type: Date,
      required: [true, 'Please provide a date for this log'],
      default: Date.now,
    },

    // Data trust metadata (web-first integrity model)
    source: {
      type: String,
      enum: ['manual', 'imported', 'mentor_verified'],
      default: 'manual',
    },
    verificationStatus: {
      type: String,
      enum: ['self_reported', 'system_verified', 'mentor_verified'],
      default: 'self_reported',
    },
    verifiedAt: {
      type: Date,
    },
    verificationNote: {
      type: String,
      maxlength: [300, 'Verification note cannot exceed 300 characters'],
    },

    // Physical Activity Metrics
    steps: {
      type: Number,
      default: 0,
      min: [0, 'Steps cannot be negative'],
    },
    distance: {
      type: Number, // in kilometers
      default: 0,
      min: [0, 'Distance cannot be negative'],
    },
    activeMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Active minutes cannot be negative'],
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: [0, 'Calories burned cannot be negative'],
    },

    // Workout Details
    workouts: [
      {
        type: {
          type: String,
          enum: [
            'Running',
            'Walking',
            'Cycling',
            'Swimming',
            'Gym',
            'Yoga',
            'Sports',
            'Dancing',
            'Other',
          ],
        },
        duration: {
          type: Number, // in minutes
          required: true,
        },
        intensity: {
          type: String,
          enum: ['Low', 'Moderate', 'High'],
          default: 'Moderate',
        },
        caloriesBurned: {
          type: Number,
          default: 0,
        },
        notes: {
          type: String,
          maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
      },
    ],

    // Lifestyle Metrics
    sleep: {
      hours: {
        type: Number,
        min: [0, 'Sleep hours cannot be negative'],
        max: [24, 'Sleep hours cannot exceed 24'],
      },
      quality: {
        type: String,
        enum: ['Poor', 'Fair', 'Good', 'Excellent'],
      },
    },

    // Nutrition
    meals: [
      {
        mealType: {
          type: String,
          enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        },
        description: {
          type: String,
          maxlength: [500, 'Meal description cannot exceed 500 characters'],
        },
        calories: {
          type: Number,
          default: 0,
        },
        healthRating: {
          type: Number,
          default: 3,
        }
      },
    ],
    totalCaloriesConsumed: {
      type: Number,
      default: 0,
    },

    // Hydration
    waterIntake: {
      type: Number, // in liters
      default: 0,
      min: [0, 'Water intake cannot be negative'],
    },

    // Screen Time (Student-specific)
    screenTime: {
      type: Number, // in hours
      default: 0,
      min: [0, 'Screen time cannot be negative'],
    },

    // Stress Level (Student-specific - exam stress tracking)
    stressLevel: {
      type: Number, // 1-10 scale
      min: 1,
      max: 10,
    },
    stressFactors: {
      type: [String], // e.g., ["Exams", "Assignments", "Social"]
      default: [],
    },

    // Mood
    mood: {
      type: String,
      enum: ['Very Bad', 'Bad', 'Neutral', 'Good', 'Excellent'],
    },

    // Weight tracking
    weight: {
      type: Number, // in kg
      min: [0, 'Weight cannot be negative'],
    },

    // Notes
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    // True when core manual lifestyle inputs are present.
    lifestyleLogCompleted: {
      type: Boolean,
      default: false,
    },
    pointsAwardedForLifestyle: {
      type: Boolean,
      default: false,
    },
    pointsAwardedForVerifiedActivity: {
      type: Boolean,
      default: false,
    },
    pointsAwardedForStreak: {
      type: Boolean,
      default: false,
    },
    pointsAwardedForWeeklyAdherence: {
      type: Boolean,
      default: false,
    },
    pointsEarnedToday: {
      type: Number,
      default: 0,
    },

    // Mentor Coaching Notes
    mentorNotes: [
      {
        mentor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [1000, 'Mentor notes cannot exceed 1000 characters'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Auto-calculated lifestyle score
    lifestyleScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const getWeekKey = (dateObj) => {
  const date = new Date(dateObj);
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${weekNo}`;
};

// ==================== INDEXES ====================
// Create indexes for faster queries
fitnessLogSchema.index({ user: 1, date: -1 }, { unique: true }); // One log per user per day
fitnessLogSchema.index({ date: -1 }); // Sort by date

// ==================== METHODS ====================

// Calculate lifestyle score based on various metrics
fitnessLogSchema.methods.calculateLifestyleScore = async function () {
  let score = 0;

  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    const targets = {
      steps: user?.targetSteps || 10000,
      calories: user?.targetCalories || 2000,
      sleep: user?.targetSleep || 8,
      water: 3 // Goal in Liters
    };

    // 1. Activity Score (Max 35 points)
    // Steps (10 pts)
    const steps = Number(this.steps) || 0;
    const stepScore = Math.min((steps / targets.steps) * 10, 10);

    // Workouts (25 pts)
    let workoutScore = 0;
    const workouts = Array.isArray(this.workouts) ? this.workouts : [];
    if (workouts.length > 0) {
      workoutScore += 10; // Presence bonus

      const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      if (totalDuration >= 45) workoutScore += 10; // Duration bonus
      else if (totalDuration > 0) workoutScore += (totalDuration / 45) * 10;

      const hasHighIntensity = workouts.some(w => w.intensity === 'High');
      if (hasHighIntensity) workoutScore += 5; // Intensity bonus
    }
    score += stepScore + workoutScore;

    // 2. Nutrition Score (Max 25 points)
    // Based on logging, calorie match, and food quality
    const mandatoryMeals = ['Breakfast', 'Lunch', 'Dinner'];
    const loggedTypes = (Array.isArray(this.meals) ? this.meals : [])
      .filter(m => mandatoryMeals.includes(m.mealType))
      .map(m => m.mealType);
    const uniqueLoggedCount = new Set(loggedTypes).size;
    const mealLoggedScore = (uniqueLoggedCount / 3) * 5; // 5 pts for logging 3 main meals

    // Calorie Match (10 pts) - Softened penalty
    let calorieScore = 0;
    const caloriesConsumed = Number(this.totalCaloriesConsumed) || 0;
    if (caloriesConsumed > 0) {
      const calDiff = Math.abs(caloriesConsumed - targets.calories);
      const calPercentOff = (calDiff / targets.calories) || 0;
      calorieScore = Math.max(10 - (calPercentOff * 15), 0); // 10 pts for match, half penalty vs before
    }

    // Food Quality (10 pts) - Based on healthRating (1-5)
    let qualityScore = 0;
    if (Array.isArray(this.meals) && this.meals.length > 0) {
      const totalRating = this.meals.reduce((sum, m) => sum + (m.healthRating || 3), 0);
      const avgRating = totalRating / this.meals.length;
      qualityScore = (avgRating / 5) * 10;
    }
    score += mealLoggedScore + calorieScore + qualityScore;

    // 3. Hydration Score (Max 15 points)
    const water = Number(this.waterIntake) || 0;
    score += Math.min((water / targets.water) * 15, 15);

    // 4. Sleep Score (Max 15 points)
    if (this.sleep && Number(this.sleep.hours) > 0) {
      const sleepDiff = Math.abs(Number(this.sleep.hours) - targets.sleep);
      score += Math.max(15 - (sleepDiff * 3), 0);
    }

    // 5. Wellness Score (Max 10 points)
    // Stress Level (lower is better, 5 pts)
    const stress = Number(this.stressLevel) || 5;
    score += Math.max(5 - (stress / 2), 0);
    // Mood (5 pts)
    const moodMap = { 'Excellent': 5, 'Good': 4, 'Neutral': 2.5, 'Bad': 1, 'Very Bad': 0 };
    score += moodMap[this.mood] || 0;

    // 6. Completion Bonus (5 pts)
    if (this.lifestyleLogCompleted && workouts.length > 0) {
      score += 5;
    }

    this.lifestyleScore = Math.min(100, Math.round(score) || 0);
    return this.lifestyleScore;
  } catch (error) {
    console.error('Error calculating lifestyle score:', error);
    return 0;
  }
};


// Create and export the FitnessLog model
const FitnessLog = mongoose.model('FitnessLog', fitnessLogSchema);

// Calculate streak and update goals
fitnessLogSchema.post('save', async function (doc) {
  try {
    const User = mongoose.model('User');
    const Goal = mongoose.model('Goal');

    // 1. Update streak, evidence-based daily points and weekly adherence.
    const user = await User.findById(doc.user);
    if (!user) return;

    let pointsToAdd = 0;

    // Streak progression
    if (!user.lastLogDate) {
      user.currentStreak = 1;
      user.lastLogDate = doc.date;
    } else {
      const last = new Date(user.lastLogDate);
      last.setHours(0, 0, 0, 0);

      const current = new Date(doc.date);
      current.setHours(0, 0, 0, 0);

      const diffTime = current.getTime() - last.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged on the next consecutive day
        user.currentStreak += 1;
        user.lastLogDate = current;
      } else if (diffDays > 1) {
        // Missed one or more days, reset streak to 1
        user.currentStreak = 1;
        user.lastLogDate = current;
      } else if (diffDays <= 0 && user.currentStreak === 0) {
        // Edge case: first log of the day but streak was somehow 0 (e.g. sync error)
        user.currentStreak = 1;
        user.lastLogDate = current;
      }
    }

    // +8 for verified activity completion
    const hasVerifiedEvidence =
      doc.verificationStatus === 'system_verified' ||
      doc.verificationStatus === 'mentor_verified';
    if (hasVerifiedEvidence && !doc.pointsAwardedForVerifiedActivity) {
      pointsToAdd += 8;
      doc.pointsAwardedForVerifiedActivity = true;
    }

    // +5 for completed lifestyle log
    if (doc.lifestyleLogCompleted && !doc.pointsAwardedForLifestyle) {
      pointsToAdd += 5;
      doc.pointsAwardedForLifestyle = true;
    }

    // Streak bonus: day2-6 => +2, day7+ => +4 (once per day)
    if (!doc.pointsAwardedForStreak && user.currentStreak >= 2) {
      pointsToAdd += user.currentStreak >= 7 ? 4 : 2;
      doc.pointsAwardedForStreak = true;
    }

    // Weekly adherence bonus: +10 if >=5 lifestyle-complete days in last 7 days.
    const weekKey = getWeekKey(doc.date);
    if (user.weeklyAdherenceBonusWeek !== weekKey) {
      const windowStart = new Date(doc.date);
      windowStart.setDate(windowStart.getDate() - 6);
      windowStart.setHours(0, 0, 0, 0);

      const completedLifestyleDays = await FitnessLog.countDocuments({
        user: doc.user,
        date: { $gte: windowStart, $lte: doc.date },
        lifestyleLogCompleted: true,
      });

      if (completedLifestyleDays >= 5) {
        pointsToAdd += 10;
        user.weeklyAdherenceBonusWeek = weekKey;
        doc.pointsAwardedForWeeklyAdherence = true;
      }
    }

    if (pointsToAdd > 0) {
      user.points = (user.points || 0) + pointsToAdd;
      doc.pointsEarnedToday = (doc.pointsEarnedToday || 0) + pointsToAdd;
    }
    user.level = Math.floor((user.points || 0) / 500) + 1;

    await user.save();
    await doc.updateOne({
      pointsAwardedForVerifiedActivity: doc.pointsAwardedForVerifiedActivity,
      pointsAwardedForLifestyle: doc.pointsAwardedForLifestyle,
      pointsAwardedForStreak: doc.pointsAwardedForStreak,
      pointsAwardedForWeeklyAdherence: doc.pointsAwardedForWeeklyAdherence,
      pointsEarnedToday: doc.pointsEarnedToday,
    });

    // 2. Automated Goal Evaluation
    const activeGoals = await Goal.find({
      user: doc.user,
      status: { $in: ['Not Started', 'In Progress'] }
    });

    for (const goal of activeGoals) {
      let metricAmt = 0;
      switch (goal.metricType) {
        case 'steps': metricAmt = doc.steps || 0; break;
        case 'calories': metricAmt = doc.caloriesBurned || 0; break;
        case 'sleep': metricAmt = doc.sleep?.hours || 0; break;
        case 'water': metricAmt = doc.waterIntake || 0; break;
        case 'activeMinutes': metricAmt = doc.activeMinutes || 0; break;
      }

      if (goal.goalMode === 'daily') {
        goal.progress = Math.min(100, Math.round((metricAmt / goal.targetValue) * 100));
        goal.status = goal.progress > 0 ? 'In Progress' : 'Not Started';
      } else if (goal.goalMode === 'weekly_cumulative') {
        // Gather all logs in the past 7 days 
        const weekStart = new Date(doc.date);
        weekStart.setDate(weekStart.getDate() - 7);
        const logs = await FitnessLog.find({ user: doc.user, date: { $gte: weekStart } });

        let total = 0;
        logs.forEach(l => {
          if (goal.metricType === 'steps') total += l.steps || 0;
          if (goal.metricType === 'calories') total += l.caloriesBurned || 0;
          if (goal.metricType === 'sleep') total += l.sleep?.hours || 0;
          if (goal.metricType === 'water') total += l.waterIntake || 0;
          if (goal.metricType === 'activeMinutes') total += l.activeMinutes || 0;
        });
        goal.progress = Math.min(100, Math.round((total / goal.targetValue) * 100));
        goal.status = goal.progress > 0 ? 'In Progress' : 'Not Started';
      }

      // Auto-complete only from trusted evidence.
      const canAutoComplete =
        doc.verificationStatus === 'system_verified' ||
        doc.verificationStatus === 'mentor_verified';

      if (goal.progress >= 100 && goal.status !== 'Completed' && canAutoComplete) {
        goal.progress = 100;
        goal.status = 'Completed';
        goal.completedDate = new Date();
        goal.points = 20;
        goal.completionMethod = 'system';

        const usr = await User.findById(doc.user);
        usr.points += 20;
        usr.level = Math.floor(usr.points / 500) + 1;
        await usr.save();
      }
      await goal.save();
    }
  } catch (error) {
    console.error('Post Save Hook Error:', error);
  }
});

module.exports = FitnessLog;