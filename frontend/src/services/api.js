import axios from 'axios';

// Base URL for your backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/updateprofile', profileData);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  },
  markMessagesRead: async () => {
    const response = await api.put('/auth/messages/read');
    return response.data;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ==================== FITNESS LOG SERVICES ====================

export const fitnessService = {
  // Create or update fitness log
  createLog: async (logData) => {
    const response = await api.post('/fitness/log', logData);
    return response.data;
  },

  // Get today's log
  getTodayLog: async () => {
    const response = await api.get('/fitness/log/today');
    return response.data;
  },

  // Get log by date
  getLogByDate: async (date) => {
    const response = await api.get(`/fitness/log/date/${date}`);
    return response.data;
  },

  // Get logs by date range
  getLogsByRange: async (startDate, endDate) => {
    const response = await api.get('/fitness/log/range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get all logs
  getAllLogs: async (page = 1, limit = 30) => {
    const response = await api.get('/fitness/log/all', {
      params: { page, limit },
    });
    return response.data;
  },

  // Update log
  updateLog: async (logId, logData) => {
    const response = await api.put(`/fitness/log/${logId}`, logData);
    return response.data;
  },

  // Delete log
  deleteLog: async (logId) => {
    const response = await api.delete(`/fitness/log/${logId}`);
    return response.data;
  },

  // Get weekly stats
  getWeeklyStats: async () => {
    const response = await api.get('/fitness/stats/week');
    return response.data;
  },

  // Get monthly stats
  getMonthlyStats: async () => {
    const response = await api.get('/fitness/stats/month');
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/fitness/dashboard');
    return response.data;
  },
};

// ==================== GOAL SERVICES ====================

export const goalService = {
  // Create goal
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  // Get all goals
  getAllGoals: async (filters = {}) => {
    const response = await api.get('/goals', { params: filters });
    return response.data;
  },

  // Get active goals
  getActiveGoals: async () => {
    const response = await api.get('/goals/active');
    return response.data;
  },

  // Get completed goals
  getCompletedGoals: async () => {
    const response = await api.get('/goals/completed');
    return response.data;
  },

  // Get goal by ID
  getGoalById: async (goalId) => {
    const response = await api.get(`/goals/${goalId}`);
    return response.data;
  },

  // Update goal
  updateGoal: async (goalId, goalData) => {
    const response = await api.put(`/goals/${goalId}`, goalData);
    return response.data;
  },

  // Update progress
  updateProgress: async (goalId, progressData) => {
    const response = await api.put(`/goals/${goalId}/progress`, progressData);
    return response.data;
  },

  // Complete goal
  completeGoal: async (goalId, payload = {}) => {
    const response = await api.put(`/goals/${goalId}/complete`, payload);
    return response.data;
  },

  // Abandon goal
  abandonGoal: async (goalId) => {
    const response = await api.put(`/goals/${goalId}/abandon`);
    return response.data;
  },

  // Delete goal
  deleteGoal: async (goalId) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  },

  // Get goal statistics
  getGoalStats: async () => {
    const response = await api.get('/goals/stats');
    return response.data;
  },
};

// ==================== ADMIN SERVICES ====================

export const adminService = {
  // Get aggregate stats
  getAggregateStats: async () => {
    const response = await api.get('/admin/aggregate-stats');
    return response.data;
  },
  // User management
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  // Mentor assignment
  getMentors: async () => {
    const response = await api.get('/admin/mentors');
    return response.data;
  },
  assignStudents: async (mentorId, studentIds) => {
    const response = await api.put(`/admin/mentors/${mentorId}/assign`, { studentIds });
    return response.data;
  },
  unassignStudent: async (mentorId, studentId) => {
    const response = await api.delete(`/admin/mentors/${mentorId}/students/${studentId}`);
    return response.data;
  },
};

// ==================== MENTOR SERVICES ====================

export const mentorService = {
  // Get assigned students (basic profile only)
  getStudents: async () => {
    const response = await api.get('/mentor/students');
    return response.data;
  },

  // Privacy-safe student summary (no raw logs)
  getStudentSummary: async (studentId) => {
    const response = await api.get(`/mentor/student/${studentId}/summary`);
    return response.data;
  },

  // Batch/department-level aggregate trends
  getBatchTrends: async () => {
    const response = await api.get('/mentor/batch-trends');
    return response.data;
  },

  // Anonymized top performers
  getTopPerformers: async () => {
    const response = await api.get('/mentor/top-performers');
    return response.data;
  },

  // Send persistent encouragement message
  sendMessage: async (studentId, message) => {
    const response = await api.post(`/mentor/message/${studentId}`, { message });
    return response.data;
  },

  // Add coaching note to a log
  addMentorNote: async (logId, content) => {
    const response = await api.post(`/mentor/log/${logId}/note`, { content });
    return response.data;
  },
};

// ==================== LEADERBOARD SERVICES ====================

export const leaderboardService = {
  // Get campus leaderboard rankings
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  },
};



export default api;