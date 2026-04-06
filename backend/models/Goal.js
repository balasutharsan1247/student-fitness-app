const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
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
    },
    targetValue: {
      type: Number,
      required: [true, 'Please provide a target value'],
    },
    metricType: {
      type: String,
      enum: ['steps', 'calories', 'sleep', 'water', 'activeMinutes'],
      required: true,
    },
    goalMode: {
      type: String,
      enum: ['daily', 'weekly_cumulative', 'streak'],
      required: true,
    },
    isAutoTracked: {
      type: Boolean,
      default: true,
    },
    verificationType: {
      type: String,
      enum: ['auto_verifiable', 'confirmable'],
      default: 'auto_verifiable',
    },
    completionMethod: {
      type: String,
      enum: ['system', 'self_confirmed', 'mentor_confirmed'],
      default: 'system',
    },
    completionEvidenceNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Completion evidence note cannot exceed 500 characters'],
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date'],
    },
    completedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned'],
      default: 'Not Started',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },

    motivationQuote: {
      type: String,
      trim: true,
    },
    rewards: [
      {
        type: String,
        trim: true,
      },
    ],
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

// Check if goal is overdue
goalSchema.methods.isOverdue = function () {
  if (this.status === 'Completed' || this.status === 'Abandoned') {
    return false;
  }
  return this.targetDate && new Date(this.targetDate) < new Date();
};

// Get days remaining until target date
goalSchema.methods.getDaysRemaining = function () {
  if (!this.targetDate) return null;

  const now = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

module.exports = mongoose.model('Goal', goalSchema);