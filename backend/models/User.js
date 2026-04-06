const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const HEALTH_CONSIDERATIONS = [
  'breathing_issues',
  'heart_restriction',
  'joint_pain',
  'diabetes_concern',
  'doctor_exercise_limit',
  'dietary_restriction',
  'vegetarian',
  'vegan',
];

// Define the User Schema (structure of user data)
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // Google Fit Integration
    googleAccessToken: {
      type: String,
      select: false,
    },
    googleRefreshToken: {
      type: String,
      select: false,
    },
    isGoogleFitConnected: {
      type: Boolean,
      default: false,
    },
    googleFitSyncEnabled: {
      type: Boolean,
      default: true,
    },

    // Role-specific account identifiers
    studentId: {
      type: String,
      default: undefined,
      set: (value) => (value === null ? undefined : value),
    },
    mentorId: {
      type: String,
      default: undefined,
      set: (value) => (value === null ? undefined : value),
    },
    adminId: {
      type: String,
      default: undefined,
      set: (value) => (value === null ? undefined : value),
    },
    university: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    graduateType: {
      type: String,
      enum: ['Under-graduate', 'Post-graduate'],
    },
    year: {
      type: String,
      enum: ['I', 'II', 'III', 'IV'],
    },
    dateOfBirth: {
      type: Date,
    },

    // Profile Information
    age: {
      type: Number,
      min: [16, 'Age must be at least 16'],
      max: [100, 'Age must be less than 100'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    healthConsiderations: {
      type: [String],
      enum: HEALTH_CONSIDERATIONS,
      default: [],
    },
    height: {
      type: Number,
      min: [0, 'Height must be positive'],
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be positive'],
    },

    // Mentor Assignment
    // For students: reference to the mentor they are assigned to
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // For mentors: list of students they supervise (denormalized for fast lookup)
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Encouragement Messages (stored persistently so students can see them)
    encouragementMessages: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, trim: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Fitness Goals
    fitnessGoals: {
      type: [String],
      default: [],
    },
    targetWeight: {
      type: Number,
    },
    targetSteps: {
      type: Number,
      default: 10000,
    },
    targetCalories: {
      type: Number,
      default: 2000,
    },
    targetSleep: {
      type: Number,
      default: 8,
    },

    // Gamification
    points: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastLogDate: {
      type: Date,
    },
    weeklyAdherenceBonusWeek: {
      type: String,
      default: '',
    },

    // Account Status
    role: {
      type: String,
      enum: ['student', 'admin', 'mentor'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique role IDs only for documents that actually have an ID value
userSchema.index(
  { studentId: 1 },
  {partialFilterExpression: { studentId: { $exists: true, $ne: null } } }
);
userSchema.index(
  { mentorId: 1 },
  { partialFilterExpression: { mentorId: { $exists: true, $ne: null } } }
);
userSchema.index(
  { adminId: 1 },
  { partialFilterExpression: { adminId: { $exists: true, $ne: null } } }
);

// ==================== MIDDLEWARE ====================

// Encrypt password before saving - MODERN SYNTAX (No next() needed)
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Generate a salt (random string to make hashing more secure)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

// ==================== METHODS ====================

// Method to compare entered password with hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Method to get public profile (without sensitive info)
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;