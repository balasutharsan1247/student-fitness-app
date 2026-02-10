import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Fitness Tracker
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {user?.firstName}! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            You're successfully logged in to your fitness tracker dashboard.
          </p>

          {/* User Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">University</p>
                <p className="font-medium">{user?.university}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium">{user?.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Points</p>
                <p className="font-medium text-primary-600">{user?.points || 0} pts</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="font-medium text-primary-600">Level {user?.level || 1}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✅ Backend connection successful!
            </p>
            <p className="text-green-700 text-sm mt-2">
              Your frontend is now connected to your backend API. We'll build more features in the next steps!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;