import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { fitnessService, goalService } from '../services/api';
import { 
  Activity, 
  LogOut, 
  TrendingUp, 
  Footprints, 
  Flame, 
  Moon, 
  Droplets,
  Plus,
  Target,
  Award
} from 'lucide-react';

// Import components
import StatCard from '../components/StatCard';
import LifestyleScoreCard from '../components/LifestyleScoreCard';
import WeeklyChart from '../components/WeeklyChart';
import GoalCard from '../components/GoalCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeGoals, setActiveGoals] = useState([]);
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard summary
        const dashResponse = await fitnessService.getDashboard();
        setDashboardData(dashResponse.data);

        // Fetch active goals
        const goalsResponse = await goalService.getActiveGoals();
        setActiveGoals(goalsResponse.data || []);

        setError('');
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        if (err.response?.status === 404) {
          // No data yet - not an error
          setDashboardData({ today: null, weekSummary: { trend: [] } });
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayData = dashboardData?.today;
  const weekData = dashboardData?.weekSummary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Fitness Tracker
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.firstName}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User points and level */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">
                    {user?.points || 0} pts
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">
                    Level {user?.level || 1}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Track your fitness journey and achieve your goals! 🎯
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/log-activity"
            className="flex items-center justify-center space-x-3 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-xl transition shadow-md">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Log Today's Activity</span>
          </Link>
          <button className="flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl transition shadow-md">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Create New Goal</span>
          </button>
          <button className="flex items-center justify-center space-x-3 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl transition shadow-md">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">View Statistics</span>
          </button>
        </div>

        {todayData ? (
          <>
            {/* Today's Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Footprints}
                label="Steps Today"
                value={todayData.steps || 0}
                target={todayData.stepsGoal || 10000}
                progress={todayData.stepsProgress || 0}
                color="bg-blue-500"
              />
              <StatCard
                icon={Flame}
                label="Calories Burned"
                value={todayData.caloriesBurned || 0}
                unit="kcal"
                color="bg-orange-500"
              />
              <StatCard
                icon={Moon}
                label="Sleep Hours"
                value={todayData.sleepHours || 0}
                unit="hours"
                target={user?.targetSleep || 8}
                color="bg-indigo-500"
              />
              <StatCard
                icon={Droplets}
                label="Water Intake"
                value={todayData.waterIntake || 0}
                unit="liters"
                target={2}
                color="bg-cyan-500"
              />
            </div>

            {/* Lifestyle Score and Weekly Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <LifestyleScoreCard score={todayData.lifestyleScore || 0} />
              </div>
              <div className="lg:col-span-2">
                <WeeklyChart data={weekData?.trend || []} />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8 text-center">
            <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Activity Logged Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start tracking your fitness journey today!
            </p>
            <Link
              to="/log-activity"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition">
              Log Your First Activity
            </Link>
          </div>
        )}

        {/* Active Goals */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Goals ({activeGoals.length})
            </h3>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All →
            </button>
          </div>

          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.slice(0, 6).map((goal) => (
                <GoalCard key={goal._id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No active goals yet</p>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition">
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
