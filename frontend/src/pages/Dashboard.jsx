import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { fitnessService, goalService, authService } from '../services/api';
import { getHealthRecommendations } from '../utils/healthRecommendations';
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
  Award,
  MessageSquare,
  ShieldCheck,
  TriangleAlert
} from 'lucide-react';

// Import components
import StatCard from '../components/StatCard';
import LifestyleScoreCard from '../components/LifestyleScoreCard';
import WeeklyChart from '../components/WeeklyChart';
import GoalCard from '../components/GoalCard';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const healthRecommendations = getHealthRecommendations(user?.healthConsiderations);
  const shouldShowWarning = ['moderate', 'high'].includes(healthRecommendations.warningLevel);

  // State
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeGoals, setActiveGoals] = useState([]);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const hydrateMessages = async () => {
      const freshUser = await refreshUser();
      const messageList = freshUser?.encouragementMessages || user?.encouragementMessages || [];
      const sortedMessages = [...messageList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMentorMessages(sortedMessages);
      setUnreadCount(sortedMessages.filter((msg) => !msg.read).length);
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await hydrateMessages();

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

    const messagePoll = setInterval(() => {
      hydrateMessages().catch((err) => {
        console.error('Message refresh failed:', err);
      });
    }, 30000);

    return () => clearInterval(messagePoll);
  }, [refreshUser]);

  const handleMarkMessagesRead = async () => {
    try {
      await authService.markMessagesRead();
      await refreshUser();
      setMentorMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  };

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
            <div className="mb-6 bg-green- dark:bg-green-/20 border border-green- dark:border-green- text-green- dark:text-green- px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-dark mb-2">
                Dashboard Overview
              </h2>
              <p className="text-muted-dark">
                Track your fitness journey and achieve your goals! 🎯
              </p>
            </div>

            {/* Streak Widget */}
            <div className="flex bg-gradient-to-r from-orange- to-orange- dark:from-green-/30 dark:to-green-/30 border border-green- dark:border-green-/50 px-6 py-4 rounded-xl items-center shadow-sm shadow-green- dark:shadow-none">
              <Flame className="w-10 h-10 text-orange- mr-4 drop-shadow-md animate-pulse" />
              <div>
                <p className="text-xs text-black- dark:text-white font-bold uppercase tracking-widest mb-1">Current Streak</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-green- dark:text-green-">
                    {dashboardData?.user?.currentStreak || user?.currentStreak || 0}
                  </span>
                  <span className="text-green- dark:text-green- font-semibold">Days</span>
                </div>
                <p className="text-xs text-green- dark:text-green- mt-1">
                  Level {dashboardData?.user?.level || user?.level || Math.floor((user?.points || 0) / 500) + 1}
                </p>
              </div>
            </div>
          </div>

          {/* Coaching Feedback Widget */}
          {mentorMessages.length > 0 && (
            <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Mentor Messages</h3>
                  {unreadCount > 0 && (
                    <span className="ml-3 inline-flex items-center rounded-full bg-green- px-2.5 py-1 text-xs font-semibold text-green- dark:bg-green-/30 dark:text-green-">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkMessagesRead}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-100 dark:bg-dark-card dark:text-green-300 dark:border-green-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {mentorMessages.slice(0, 5).map((msg, index) => (
                  <div key={`${msg.createdAt}-${index}`} className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm border border-green-100 dark:border-green-800/50">
                    <p className="text-dark whitespace-pre-wrap">{msg.message}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-dark">
                      <span className="font-medium text-green-700 dark:text-green-300">
                        From: {msg.fromName || 'Mentor'}
                      </span>
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboardData?.recentNotes && dashboardData.recentNotes.length > 0 && (
            <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Recent Coaching Feedback</h3>
              </div>
              <div className="space-y-4">
                {dashboardData.recentNotes.map((note, index) => (
                  <div key={index} className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm border border-green-100 dark:border-green-800/50">
                    <p className="text-dark whitespace-pre-wrap flex-1">{note.content}</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-muted-dark">
                      <span className="font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                        Log: {new Date(note.logDate).toLocaleDateString()}
                      </span>
                      <span>{new Date(note.date).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/log-activity"
              className="flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white p-4 rounded-xl transition-colors duration-200 shadow-md dark:shadow-lg"
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
              className="flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white p-4 rounded-xl transition-colors duration-200 shadow-md dark:shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">View Statistics</span>
            </Link>
          </div>

          {shouldShowWarning && (
            <div
              className={`mb-8 rounded-2xl border p-5 ${healthRecommendations.warningLevel === 'high'
                ? 'bg-green- border-green- text-green- dark:bg-green-/20 dark:border-green- dark:text-green-'
                : 'bg-green- border-green- text-green- dark:bg-green-/20 dark:border-green- dark:text-green-'
                }`}
            >
              <div className="flex items-start gap-3">
                <TriangleAlert className="w-6 h-6" />
                <div>
                  <p className="text-sm font-semibold">
                    Wellness notice
                  </p>
                  <p className="mt-1 text-sm text-muted-dark">
                    {healthRecommendations.warningLevel === 'high'
                      ? 'Choose gentle movement and avoid intense activity until you feel comfortable.'
                      : 'Practice caution with higher-intensity activity and prioritize gentle movement.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-dark mb-3">Safe Exercise Suggestions</h3>
              <p className="text-sm text-muted-dark mb-4">
                Gentle ideas to keep moving safely.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-dark">
                {healthRecommendations.safeExercises.length > 0 ? (
                  healthRecommendations.safeExercises.map((exercise) => (
                    <li key={exercise}>{exercise}</li>
                  ))
                ) : (
                  <li className="text-muted-dark">No specific exercise guidance right now.</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-dark mb-3">Food Guidance</h3>
              <p className="text-sm text-muted-dark mb-4">
                Simple, general nutrition reminders.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-dark">
                {healthRecommendations.foodGuidance.length > 0 ? (
                  healthRecommendations.foodGuidance.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))
                ) : (
                  <li className="text-muted-dark">No specific food guidance right now.</li>
                )}
              </ul>
            </div>
          </div>

          <p className="text-xs text-muted-dark mb-8">
            These are general wellness suggestions only and are not medical advice. Consult a healthcare professional for personalized guidance.
          </p>

          {todayData ? (
            <>
              <div className="mb-4">
                {todayData.verificationStatus === 'self_reported' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green- dark:bg-green-/20 border border-green- dark:border-green- text-green- dark:text-green- text-sm">
                    <TriangleAlert className="w-4 h-4" />
                    <span>Today&apos;s metrics are self-reported.</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Today&apos;s metrics are verified.</span>
                  </div>
                )}
              </div>

              {/* Today's Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={Footprints}
                  label="Steps Today"
                  value={todayData.steps || 0}
                  target={todayData.stepsGoal || 10000}
                  progress={todayData.stepsProgress || 0}
                  color="bg-green-500 dark:bg-green-600"
                />
                <StatCard
                  icon={Flame}
                  label="Calories Burned"
                  value={todayData.caloriesBurned || 0}
                  unit="kcal"
                  color="bg-green- dark:bg-green-"
                />
                <StatCard
                  icon={Moon}
                  label="Sleep Hours"
                  value={todayData.sleepHours || 0}
                  unit="hours"
                  target={user?.targetSleep || 8}
                  color="bg-green-500 dark:bg-green-600"
                />
                <StatCard
                  icon={Droplets}
                  label="Water Intake"
                  value={todayData.waterIntake || 0}
                  unit="liters"
                  target={2}
                  color="bg-green-500 dark:bg-green-600"
                />
              </div>

              {/* Lifestyle Score and Weekly Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  {/* Assuming LifestyleScoreCard also accepts a color prop */}
                  <LifestyleScoreCard
                    score={todayData.lifestyleScore || 0}
                    color="#10b981"
                  />
                </div>

                <div className="lg:col-span-2">
                  {/* Added color prop to the WeeklyChart */}
                  <WeeklyChart
                    data={weekData?.trend || []}
                    color="#10b981"
                  />
                </div>
              </div>

              <p className="text-xs text-emerald-600 font-medium mb-2">
                Verified days this week: {weekData?.verifiedDays || 0} / {weekData?.activeDays || 0}
              </p>

              <p className="text-xs text-emerald-600 font-medium mb-8">
                Points earned today: {todayData.pointsEarnedToday || 0}
              </p>
            </>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-8 mb-8 text-center">
              <Activity className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark mb-2">
                No Activity Logged Yet
              </h3>
              <p className="text-muted-dark mb-4">
                Start tracking your fitness journey today!
              </p>
              <Link
                to="/log-activity"
                className="inline-block bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
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