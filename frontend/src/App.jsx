import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import Goals from './pages/Goals';
import CreateGoal from './pages/CreateGoal';
import GoalDetail from './pages/GoalDetail';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoles from './pages/AdminRoles';
import MentorDashboard from './pages/MentorDashboard';
import Leaderboard from './pages/Leaderboard';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
            <ProtectedRoute>
              <AdminRoles />
            </ProtectedRoute>
            }
          />
          <Route
            path="/mentor"
            element={
            <ProtectedRoute>
              <MentorDashboard />
            </ProtectedRoute>
            }
          />
          <Route
            path="/log-activity"
            element={
              <ProtectedRoute>
                <LogActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/create"
            element={
              <ProtectedRoute>
                <CreateGoal />
              </ProtectedRoute>
              }
          />
          <Route 
            path="/goals/:id"
            element={
              <ProtectedRoute>
                <GoalDetail />
              </ProtectedRoute>
              }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;