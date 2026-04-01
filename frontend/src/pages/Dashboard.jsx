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
import Layout from '../components/Layout';

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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-muted-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayData = dashboardData?.today;
  const weekData = dashboardData?.weekSummary;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark mb-2">
              Dashboard Overview
            </h2>
            <p className="text-muted-dark">
              Track your fitness journey and achieve your goals! 🎯
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/log-activity"
              className="flex items-center justify-center space-x-3 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white p-4 rounded-xl transition-colors duration-200 shadow-md dark:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Log Today's Activity</span>
            </Link>
            <Link
              to="/goals/create"
              className="flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white p-4 rounded-xl transition-colors duration-200 shadow-md dark:shadow-lg"
            >
              <Target className="w-5 h-5" />
              <span className="font-semibold">Create New Goal</span>
            </Link>
            <Link
              to="/statistics"
              className="flex items-center justify-center space-x-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white p-4 rounded-xl transition-colors duration-200 shadow-md dark:shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">View Statistics</span>
            </Link>
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
                  color="bg-blue-500 dark:bg-blue-600"
                />
                <StatCard
                  icon={Flame}
                  label="Calories Burned"
                  value={todayData.caloriesBurned || 0}
                  unit="kcal"
                  color="bg-orange-500 dark:bg-orange-600"
                />
                <StatCard
                  icon={Moon}
                  label="Sleep Hours"
                  value={todayData.sleepHours || 0}
                  unit="hours"
                  target={user?.targetSleep || 8}
                  color="bg-indigo-500 dark:bg-indigo-600"
                />
                <StatCard
                  icon={Droplets}
                  label="Water Intake"
                  value={todayData.waterIntake || 0}
                  unit="liters"
                  target={2}
                  color="bg-cyan-500 dark:bg-cyan-600"
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-8 mb-8 text-center">
              <Activity className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark mb-2">
                No Activity Logged Yet
              </h3>
              <p className="text-muted-dark mb-4">
                Start tracking your fitness journey today!
              </p>
              <Link
                to="/log-activity"
                className="inline-block bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Log Your First Activity
              </Link>
            </div>
          )}

          {/* Active Goals */}
          <div className="card-dark rounded-xl shadow-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark">
                Active Goals ({activeGoals.length})
              </h3>
              <Link
                to="/goals"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200"
              >
                View All →
              </Link>
            </div>

            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.slice(0, 6).map((goal) => (
                  <GoalCard key={goal._id} goal={goal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 dark:text-dark-muted mx-auto mb-3" />
                <p className="text-muted-dark mb-4">No active goals yet</p>
                <Link
                  to="/goals/create"
                  className="inline-block bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Create Your First Goal
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;