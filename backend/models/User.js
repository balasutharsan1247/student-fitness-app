const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

    // Student information
    studentId: {
      type: String,
      unique: true,
      sparse: true,
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
    height: {
      type: Number,
      min: [0, 'Height must be positive'],
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be positive'],
    },

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
    },
    badges: {
      type: [String],
      default: [],
    },

    // Account Status
    role: {
      type: String,
      enum: ['student', 'admin', 'educator'],
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