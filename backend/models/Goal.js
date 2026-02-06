const mongoose = require('mongoose');

// Define the Goal Schema
const goalSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this goal
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Goal must belong to a user'],
    },

    // Goal Details
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
      maxlength: [100, 'Goal title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Goal description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: [
        'Weight Loss',
        'Weight Gain',
        'Muscle Building',
        'Cardio',
        'Flexibility',
        'Sleep',
        'Nutrition',
        'Hydration',
        'Steps',
        'General Fitness',
        'Stress Management',
        'Other',
      ],
      required: [true, 'Please select a goal category'],
    },

    // Goal Metrics
    targetValue: {
      type: Number,
      required: [true, 'Please provide a target value'],
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String, // e.g., "kg", "steps", "hours", "liters"
      required: [true, 'Please provide a unit'],
    },

    // Timeline
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'Target date must be after start date',
      },
    },
    completedDate: {
      type: Date,
    },

    // Status
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned'],
      default: 'Not Started',
    },
    progress: {
      type: Number, // Percentage (0-100)
      default: 0,
      min: 0,
      max: 100,
    },

    // Gamification
    points: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String, // Badge earned upon completion
    },

    // Motivation
    motivationQuote: {
      type: String,
    },
    rewards: {
      type: [String], // Personal rewards for milestones
      default: [],
    },

    // Tracking
    milestones: [
      {
        value: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
        },
        achieved: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Reminders
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderFrequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
      default: 'Weekly',
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ targetDate: 1 });

// ==================== METHODS ====================

// Calculate progress percentage
goalSchema.methods.calculateProgress = function () {
  if (this.targetValue === 0) {
    this.progress = 0;
    return 0;
  }

  const progressPercentage = (this.currentValue / this.targetValue) * 100;
  this.progress = Math.min(Math.round(progressPercentage), 100);

  // Update status based on progress
  if (this.progress === 0) {
    this.status = 'Not Started';
  } else if (this.progress >= 100) {
    this.status = 'Completed';
    if (!this.completedDate) {
      this.completedDate = new Date();
    }
  } else {
    this.status = 'In Progress';
  }

  return this.progress;
};

// Check if goal is overdue
goalSchema.methods.isOverdue = function () {
  return (
    this.status !== 'Completed' &&
    this.status !== 'Abandoned' &&
    new Date() > this.targetDate
  );
};

// Get days remaining
goalSchema.methods.getDaysRemaining = function () {
  const today = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Award points based on progress
goalSchema.methods.awardPoints = function () {
  const basePoints = 100;
  const progressBonus = (this.progress / 100) * basePoints;
  const timeBonus = this.isOverdue() ? 0 : 50; // Bonus for completing on time
  
  this.points = Math.round(progressBonus + timeBonus);
  return this.points;
};

// Create and export the Goal model
const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;