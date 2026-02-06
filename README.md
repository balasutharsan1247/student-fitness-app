# Student Fitness Tracker - Backend API

A comprehensive MERN stack fitness tracking application designed for students, featuring personalized health insights, goal management, and gamification.

## 🚀 Features

### Authentication & User Management
- ✅ Secure user registration and login (JWT)
- ✅ Password encryption with bcryptjs
- ✅ Protected routes and authorization
- ✅ User profile management
- ✅ Role-based access control (student, educator, admin)

### Fitness Tracking
- ✅ Daily activity logging (steps, distance, active minutes)
- ✅ Workout tracking with multiple workout types
- ✅ Meal and nutrition logging
- ✅ Sleep quality monitoring
- ✅ Hydration tracking
- ✅ Screen time tracking
- ✅ Stress level and mood tracking
- ✅ Automatic lifestyle score calculation (0-100)

### Statistics & Analytics
- ✅ Weekly statistics (7-day trends)
- ✅ Monthly statistics (30-day analysis)
- ✅ Dashboard summary with real-time data
- ✅ Progress visualization data
- ✅ Best/worst day tracking

### Goal Management
- ✅ Create custom fitness goals
- ✅ Multiple goal categories (Weight Loss, Cardio, Steps, Sleep, etc.)
- ✅ Progress tracking with auto-calculation
- ✅ Milestone tracking
- ✅ Goal completion detection
- ✅ Points and rewards system
- ✅ Goal statistics and insights
- ✅ Upcoming deadlines and overdue tracking

### Gamification
- ✅ Points system for achievements
- ✅ Badge collection
- ✅ User levels
- ✅ Goal completion rewards
- ✅ Motivation quotes

## 🛠️ Tech Stack

- **Runtime:** Node.js v20+
- **Framework:** Express.js v5.2
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose v9.1
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcryptjs
- **Environment:** dotenv
- **CORS:** cors

## 📁 Project Structure
```
backend/
├── controllers/
│   ├── authController.js          # Authentication logic
│   ├── fitnessLogController.js    # Fitness tracking logic
│   └── goalController.js          # Goal management logic
│
├── middleware/
│   └── auth.js                    # JWT verification & authorization
│
├── models/
│   ├── User.js                    # User schema
│   ├── FitnessLog.js              # Fitness log schema
│   └── Goal.js                    # Goal schema
│
├── routes/
│   ├── auth.js                    # Auth routes
│   ├── fitnessLog.js              # Fitness routes
│   └── goal.js                    # Goal routes
│
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies
├── README.md                      # Documentation
└── server.js                      # Main server file
```

## 🔌 API Endpoints

### Authentication (5 endpoints)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user (protected)
PUT    /api/auth/updateprofile     - Update user profile (protected)
PUT    /api/auth/updatepassword    - Update password (protected)
```

### Fitness Tracking (10 endpoints)
```
POST   /api/fitness/log            - Create/update fitness log (protected)
GET    /api/fitness/log/today      - Get today's log (protected)
GET    /api/fitness/log/date/:date - Get log by date (protected)
GET    /api/fitness/log/range      - Get logs by date range (protected)
GET    /api/fitness/log/all        - Get all logs (protected)
PUT    /api/fitness/log/:id        - Update log by ID (protected)
DELETE /api/fitness/log/:id        - Delete log (protected)
GET    /api/fitness/stats/week     - Get weekly statistics (protected)
GET    /api/fitness/stats/month    - Get monthly statistics (protected)
GET    /api/fitness/dashboard      - Get dashboard summary (protected)
```

### Goal Management (11 endpoints)
```
POST   /api/goals                  - Create goal (protected)
GET    /api/goals                  - Get all goals (protected)
GET    /api/goals/active           - Get active goals (protected)
GET    /api/goals/completed        - Get completed goals (protected)
GET    /api/goals/:id              - Get goal by ID (protected)
PUT    /api/goals/:id              - Update goal (protected)
PUT    /api/goals/:id/progress     - Update progress (protected)
PUT    /api/goals/:id/complete     - Mark as complete (protected)
PUT    /api/goals/:id/abandon      - Mark as abandoned (protected)
DELETE /api/goals/:id              - Delete goal (protected)
GET    /api/goals/stats            - Get goal statistics (protected)
```

**Total: 27 API Endpoints**

## 🚀 Getting Started

### Prerequisites
- Node.js v20 or higher
- MongoDB Atlas account (free tier)
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/student-fitness-app.git
   cd student-fitness-app/backend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Create environment variables**
   
   Create a `.env` file in the backend directory:
```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key_min_32_characters
   NODE_ENV=development
```

4. **Start the server**
   
   Development mode (with auto-restart):
```bash
   npm run dev
```
   
   Production mode:
```bash
   npm start
```

5. **Verify server is running**
   
   Open browser and go to: `http://localhost:5000`
   
   You should see:
```json
   {
     "message": "Welcome to Student Fitness Tracker API!",
     "status": "Server is running successfully"
   }
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port number | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/dbname |
| JWT_SECRET | Secret key for JWT tokens | my-super-secret-key-at-least-32-chars |
| NODE_ENV | Environment mode | development / production |

## 🧪 Testing

Use [Postman](https://www.postman.com/) or any API testing tool.

### Example: Register a User

**Request:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "securePassword123",
  "studentId": "STU2024001",
  "university": "Tech University",
  "major": "Computer Science",
  "year": "Junior",
  "age": 21,
  "gender": "Male"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65c1234567890abcdef12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    ...
  }
}
```

### Example: Create Fitness Log

**Request:**
```http
POST http://localhost:5000/api/fitness/log
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "steps": 10000,
  "activeMinutes": 45,
  "caloriesBurned": 350,
  "workouts": [
    {
      "type": "Running",
      "duration": 30,
      "intensity": "Moderate",
      "caloriesBurned": 250
    }
  ],
  "sleep": {
    "hours": 7.5,
    "quality": "Good"
  },
  "waterIntake": 2.5,
  "mood": "Excellent"
}
```

## 📊 Features Explained

### Lifestyle Score Algorithm

The lifestyle score (0-100) is automatically calculated based on:
- **Steps** (max 20 points): Progress toward 10,000 daily steps
- **Sleep** (max 20 points): Proximity to 8 hours
- **Water Intake** (max 15 points): Progress toward 2 liters
- **Active Minutes** (max 15 points): Progress toward 30 minutes
- **Workouts** (max 15 points): Presence of workout activity
- **Stress Level** (max 10 points): Lower stress is better (1-10 scale)
- **Mood** (max 5 points): Very Bad (0) to Excellent (5)

### Goal Progress Tracking

Goals automatically:
- Calculate progress percentage
- Update status (Not Started → In Progress → Completed)
- Award points upon completion
- Set completion date
- Track milestones

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (never stored in plain text)
- ✅ JWT tokens for stateless authentication
- ✅ Protected routes requiring valid tokens
- ✅ User data isolation (users can only access their own data)
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for controlled access
- ✅ Input validation on all endpoints

## 🎯 Development Roadmap

### Completed ✅
- [x] User authentication system
- [x] Fitness activity tracking
- [x] Lifestyle score calculation
- [x] Weekly/monthly statistics
- [x] Goal management system
- [x] Points and gamification

### Planned 🚧
- [ ] Social features (friends, challenges)
- [ ] Leaderboards
- [ ] Push notifications
- [ ] Wearable device integration (Fitbit, Apple Watch)
- [ ] AI-powered recommendations
- [ ] Admin dashboard
- [ ] Data export (PDF reports)
- [ ] Email notifications

## 📄 License

This project is part of a learning exercise.

## 👨‍💻 Author

Built step-by-step as a MERN stack learning project.

## 🙏 Acknowledgments

- MongoDB Atlas for cloud database hosting
- Anthropic Claude for development guidance
- The MERN stack community

---

**Status:** ✅ Backend Complete - 27 API Endpoints Functional

**Next Phase:** Frontend Development with React.js