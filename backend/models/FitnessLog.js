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
          maxlength: [200, 'Meal description cannot exceed 200 characters'],
        },
        calories: {
          type: Number,
          min: [0, 'Calories cannot be negative'],
        },
        location: {
          type: String, // e.g., "Campus Cafeteria", "Home", "Restaurant"
        },
        healthRating: {
          type: Number, // 1-5 scale
          min: 1,
          max: 5,
        },
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

// ==================== INDEXES ====================
// Create indexes for faster queries
fitnessLogSchema.index({ user: 1, date: -1 }); // Sort by date for user
fitnessLogSchema.index({ date: -1 }); // Sort by date

// ==================== METHODS ====================

// Calculate lifestyle score based on various metrics
fitnessLogSchema.methods.calculateLifestyleScore = function () {
  let score = 0;
  let maxScore = 0;

  // Steps score (max 20 points)
  if (this.steps !== undefined) {
    maxScore += 20;
    const stepGoal = 10000;
    score += Math.min((this.steps / stepGoal) * 20, 20);
  }

  // Sleep score (max 20 points)
  if (this.sleep && this.sleep.hours !== undefined) {
    maxScore += 20;
    const sleepGoal = 8;
    const sleepScore = Math.abs(this.sleep.hours - sleepGoal);
    score += Math.max(20 - sleepScore * 3, 0);
  }

  // Water intake score (max 15 points)
  if (this.waterIntake !== undefined) {
    maxScore += 15;
    const waterGoal = 2; // liters
    score += Math.min((this.waterIntake / waterGoal) * 15, 15);
  }

  // Active minutes score (max 15 points)
  if (this.activeMinutes !== undefined) {
    maxScore += 15;
    const activeGoal = 30; // minutes
    score += Math.min((this.activeMinutes / activeGoal) * 15, 15);
  }

  // Workout score (max 15 points)
  if (this.workouts && this.workouts.length > 0) {
    maxScore += 15;
    score += 15;
  }

  // Stress level score (max 10 points) - lower stress is better
  if (this.stressLevel !== undefined) {
    maxScore += 10;
    score += Math.max(10 - this.stressLevel, 0);
  }

  // Mood score (max 5 points)
  if (this.mood) {
    maxScore += 5;
    const moodScores = {
      'Very Bad': 0,
      'Bad': 1,
      'Neutral': 2.5,
      'Good': 4,
      'Excellent': 5,
    };
    score += moodScores[this.mood] || 0;
  }

  // Calculate final score (0-100 scale)
  this.lifestyleScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return this.lifestyleScore;
};

// Create and export the FitnessLog model
const FitnessLog = mongoose.model('FitnessLog', fitnessLogSchema);

module.exports = FitnessLog;