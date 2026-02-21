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
    currentValue: {
      type: Number,
      default: 0,
    },
    startingValue: {
      type: Number,
      default: 0,
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
    badge: {
      type: String,
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

// ==================== METHODS ====================

// Calculate progress percentage
// Calculate progress percentage
goalSchema.methods.calculateProgress = function () {
  if (this.targetValue !== undefined && this.currentValue !== undefined) {
    // Use startingValue, fallback to currentValue only if startingValue is not set
    let startValue = this.startingValue;
    
    // If startingValue is not set yet (shouldn't happen with fix above)
    if (startValue === undefined || startValue === null) {
      startValue = this.currentValue;
    }
    
    // Determine if this is a reduction goal (weight loss) or increase goal
    const isReductionGoal = this.targetValue < startValue;
    
    if (isReductionGoal) {
      // For weight loss: progress = how much lost / how much needs to be lost
      const totalToLose = startValue - this.targetValue;
      const amountLost = startValue - this.currentValue;
      
      if (totalToLose > 0) {
        this.progress = Math.max(0, Math.min(100, Math.round((amountLost / totalToLose) * 100)));
      } else {
        this.progress = 0;
      }
    } else {
      // For increase goals: progress = how much gained / how much needs to be gained
      const totalToGain = this.targetValue - startValue;
      const amountGained = this.currentValue - startValue;
      
      if (totalToGain > 0) {
        this.progress = Math.max(0, Math.min(100, Math.round((amountGained / totalToGain) * 100)));
      } else if (totalToGain === 0) {
        this.progress = 100;
      } else {
        this.progress = 0;
      }
    }

    // Auto-update status based on progress
    if (this.progress >= 100 && this.status !== 'Completed') {
      this.status = 'Completed';
      this.completedDate = Date.now();
      
      // Award points when auto-completing
      this.awardPoints();
    } else if (this.progress > 0 && this.status === 'Not Started') {
      this.status = 'In Progress';
    }
  }
};

// Award points based on completion with bonuses
goalSchema.methods.awardPoints = function () {
  let points = 100; // Base points

  // BONUS 1: Early Completion
  if (this.targetDate && this.completedDate) {
    const deadline = new Date(this.targetDate);
    const completed = new Date(this.completedDate);

    if (completed < deadline) {
      const daysEarly = Math.ceil(
        (deadline - completed) / (1000 * 60 * 60 * 24)
      );

      if (daysEarly >= 7) {
        points += 50;
      } else if (daysEarly >= 3) {
        points += 30;
      } else if (daysEarly >= 1) {
        points += 20;
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

  points += categoryBonuses[this.category] || 15;

  // BONUS 3: Progress Achievement
  const startValue = this.startingValue || 0;
  const progressMade = this.currentValue - startValue;
  const targetRange = Math.abs(this.targetValue - startValue);

  if (targetRange > 0) {
    const progressPercent = (Math.abs(progressMade) / targetRange) * 100;
    if (progressPercent >= 100) {
      points += 25;
    }
  }

  // BONUS 4: Long-term Commitment
  if (this.startDate && this.completedDate) {
    const duration = Math.ceil(
      (new Date(this.completedDate) - new Date(this.startDate)) /
        (1000 * 60 * 60 * 24)
    );

    if (duration >= 60) {
      points += 40;
    } else if (duration >= 30) {
      points += 25;
    } else if (duration >= 14) {
      points += 15;
    }
  }

  // BONUS 5: Milestones
  if (this.milestones && this.milestones.length > 0) {
    const achievedMilestones = this.milestones.filter((m) => m.achieved).length;
    points += achievedMilestones * 10;
  }

  this.points = points;
  return points;
};

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

// ==================== MIDDLEWARE ====================

// Set starting value on creation
goalSchema.pre('save', function () {
  // Only set startingValue when creating a new goal
  if (this.isNew && this.currentValue !== undefined) {
    this.startingValue = this.currentValue;
  }
});

module.exports = mongoose.model('Goal', goalSchema);