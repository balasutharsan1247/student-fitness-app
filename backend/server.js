// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow server to read JSON data
app.use(express.urlencoded({ extended: true })); // Allow server to read form data

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Student Fitness Tracker API!',
    status: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Backend is healthy and running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ==================== IMPORT ROUTES ====================
const authRoutes = require('./routes/auth');
const fitnessLogRoutes = require('./routes/fitnessLog');
const goalRoutes = require('./routes/goal'); 

// ==================== MOUNT ROUTES ====================
// All auth routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// All fitness routes will be prefixed with /api/fitness
app.use('/api/fitness', fitnessLogRoutes);

// All goal routes will be prefixed with /api/goals
app.use('/api/goals', goalRoutes);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Removed useNewUrlParser and useUnifiedTopology as they are 
    // no longer supported in Mongoose 9.x
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Execute Database Connection
connectDB();

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log('🚀 Server is running!');
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Press Ctrl+C to stop the server');
});