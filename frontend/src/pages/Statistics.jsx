import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { fitnessService, goalService } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Target,
  Award,
  Calendar,
  Flame,
  Footprints,
  Moon,
  Droplets,
  Dumbbell,
  UtensilsCrossed,
} from 'lucide-react';

const Statistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('30'); // 7, 30, 90, all
  const [workoutMetric, setWorkoutMetric] = useState('count'); // count, duration, calories
  const [activityMetrics, setActivityMetrics] = useState(['steps', 'calories', 'sleep']); // Selected metrics to display
  const [stats, setStats] = useState({
    overview: {},
    activityTrend: [],
    lifestyleScoreTrend: [],
    goalStats: {},
    categoryBreakdown: [],
    workoutBreakdown: [],
    nutritionSummary: {},
  });

  useEffect(() => {
    fetchStatistics();
  }, [timePeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      if (timePeriod !== 'all') {
        startDate.setDate(startDate.getDate() - parseInt(timePeriod));
      } else {
        startDate = new Date('2020-01-01'); // Far back date
      }

      // Fetch fitness logs
      const logsResponse = await fitnessService.getLogsByRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const logs = logsResponse.data || [];

      // Fetch goal stats
      const goalsResponse = await goalService.getGoalStats();
      const goalStats = goalsResponse.data;

      // Process data
      processStatistics(logs, goalStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processStatistics = (logs, goalStats) => {
    // Sort logs by date (oldest to newest)
    const sortedLogs = logs.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Overview stats
    const overview = {
      totalLogs: sortedLogs.length,
      totalSteps: sortedLogs.reduce((sum, log) => sum + (log.steps || 0), 0),
      totalCaloriesBurned: sortedLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0),
      totalCaloriesConsumed: sortedLogs.reduce((sum, log) => sum + (log.totalCaloriesConsumed || 0), 0),
      averageLifestyleScore: sortedLogs.length > 0
        ? Math.round(sortedLogs.reduce((sum, log) => sum + (log.lifestyleScore || 0), 0) / sortedLogs.length)
        : 0,
      totalWorkouts: sortedLogs.reduce((sum, log) => sum + (log.workouts?.length || 0), 0),
      totalMeals: sortedLogs.reduce((sum, log) => sum + (log.meals?.length || 0), 0),
      averageSleep: sortedLogs.length > 0
        ? (sortedLogs.reduce((sum, log) => sum + (log.sleep?.hours || 0), 0) / sortedLogs.length).toFixed(1)
        : 0,
      averageWater: sortedLogs.length > 0
        ? (sortedLogs.reduce((sum, log) => sum + (log.waterIntake || 0), 0) / sortedLogs.length).toFixed(1)
        : 0,
    };

    // Activity trend (sorted by date, left to right) - include all metrics
    const maxDays = parseInt(timePeriod === 'all' ? 30 : timePeriod);
    const activityTrend = sortedLogs
      .slice(-Math.min(maxDays, sortedLogs.length))
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        steps: log.steps || 0,
        calories: log.caloriesBurned || 0,
        sleep: log.sleep?.hours || 0,
        water: log.waterIntake || 0,
        activeMinutes: log.activeMinutes || 0,
        distance: log.distance || 0,
      }));

    // Lifestyle score trend (sorted by date, left to right)
    const lifestyleScoreTrend = sortedLogs
      .slice(-Math.min(maxDays, sortedLogs.length))
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: log.lifestyleScore || 0,
      }));

    // Workout breakdown by type with count, duration, and calories
    const workoutStats = {};
    sortedLogs.forEach(log => {
      log.workouts?.forEach(workout => {
        if (!workoutStats[workout.type]) {
          workoutStats[workout.type] = {
            count: 0,
            duration: 0,
            calories: 0,
          };
        }
        workoutStats[workout.type].count += 1;
        workoutStats[workout.type].duration += workout.duration || 0;
        workoutStats[workout.type].calories += workout.caloriesBurned || 0;
      });
    });

    const workoutBreakdown = Object.entries(workoutStats)
      .map(([type, data]) => ({
        type,
        count: data.count,
        duration: data.duration,
        calories: data.calories,
      }))
      .sort((a, b) => b.count - a.count);

    // Category breakdown (from goals)
    const categoryBreakdown = Object.entries(goalStats.categoryCounts || {})
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Nutrition summary
    const nutritionSummary = {
      totalConsumed: overview.totalCaloriesConsumed,
      totalBurned: overview.totalCaloriesBurned,
      netCalories: overview.totalCaloriesConsumed - overview.totalCaloriesBurned,
      averageDaily: sortedLogs.length > 0 ? Math.round(overview.totalCaloriesConsumed / sortedLogs.length) : 0,
    };

    setStats({
      overview,
      activityTrend,
      lifestyleScoreTrend,
      goalStats,
      categoryBreakdown,
      workoutBreakdown,
      nutritionSummary,
    });
  };

  // Get workout data based on selected metric
  const getWorkoutChartData = () => {
    return stats.workoutBreakdown.map(workout => ({
      type: workout.type,
      value: workout[workoutMetric],
    }));
  };

  // Get y-axis label based on metric
  const getWorkoutYAxisLabel = () => {
    switch (workoutMetric) {
      case 'count':
        return 'Number of Workouts';
      case 'duration':
        return 'Total Minutes';
      case 'calories':
        return 'Total Calories Burned';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Colors for charts (different colors for each item)
  const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  // Toggle activity metric selection
const toggleActivityMetric = (metric) => {
  setActivityMetrics(prev => {
    if (prev.includes(metric)) {
      // Remove if already selected (but keep at least one)
      if (prev.length > 1) {
        return prev.filter(m => m !== metric);
      }
      return prev; // Don't remove if it's the last one
    } else {
      // Add if not selected
      return [...prev, metric];
    }
  });
};

// Get color for activity metric
const getActivityMetricColor = (metric) => {
  const colors = {
    steps: '#0ea5e9',
    calories: '#f59e0b',
    sleep: '#8b5cf6',
    water: '#06b6d4',
    activeMinutes: '#10b981',
    distance: '#ec4899',
  };
  return colors[metric] || '#6b7280';
};

// Get name for activity metric
const getActivityMetricName = (metric) => {
  const names = {
    steps: 'Steps',
    calories: 'Calories Burned',
    sleep: 'Sleep (hours)',
    water: 'Water (liters)',
    activeMinutes: 'Active Minutes',
    distance: 'Distance (km)',
  };
  return names[metric] || metric;
};

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
              <p className="text-gray-600 mt-1">
                Detailed insights into your fitness journey
              </p>
            </div>

            {/* Time Period Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.overview.totalLogs}
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Activities Logged</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Footprints className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.overview.totalSteps.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Steps</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.goalStats?.completed || 0}
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Goals Completed</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {user?.points || 0}
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Points Earned</p>
            </div>
          </div>

          {/* Activity Trends Chart with Metric Selection */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Activity Trends
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <div className="flex flex-wrap gap-2">
                  {['steps', 'calories', 'sleep', 'water', 'activeMinutes', 'distance'].map(metric => (
                    <button
                      key={metric}
                      onClick={() => toggleActivityMetric(metric)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        activityMetrics.includes(metric)
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: activityMetrics.includes(metric) ? getActivityMetricColor(metric) : undefined,
                      }}
                    >
                      {getActivityMetricName(metric)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {stats.activityTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {activityMetrics.includes('steps') && (
                    <Line
                      type="monotone"
                      dataKey="steps"
                      stroke={getActivityMetricColor('steps')}
                      strokeWidth={2}
                      name={getActivityMetricName('steps')}
                      dot={{ fill: getActivityMetricColor('steps'), r: 4 }}
                    />
                  )}
                  {activityMetrics.includes('calories') && (
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke={getActivityMetricColor('calories')}
                      strokeWidth={2}
                      name={getActivityMetricName('calories')}
                      dot={{ fill: getActivityMetricColor('calories'), r: 4 }}
                    />
                  )}
                  {activityMetrics.includes('sleep') && (
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke={getActivityMetricColor('sleep')}
                      strokeWidth={2}
                      name={getActivityMetricName('sleep')}
                      dot={{ fill: getActivityMetricColor('sleep'), r: 4 }}
                    />
                  )}
                  {activityMetrics.includes('water') && (
                    <Line
                      type="monotone"
                      dataKey="water"
                      stroke={getActivityMetricColor('water')}
                      strokeWidth={2}
                      name={getActivityMetricName('water')}
                      dot={{ fill: getActivityMetricColor('water'), r: 4 }}
                    />
                  )}
                  {activityMetrics.includes('activeMinutes') && (
                    <Line
                      type="monotone"
                      dataKey="activeMinutes"
                      stroke={getActivityMetricColor('activeMinutes')}
                      strokeWidth={2}
                      name={getActivityMetricName('activeMinutes')}
                      dot={{ fill: getActivityMetricColor('activeMinutes'), r: 4 }}
                    />
                  )}
                  {activityMetrics.includes('distance') && (
                    <Line
                      type="monotone"
                      dataKey="distance"
                      stroke={getActivityMetricColor('distance')}
                      strokeWidth={2}
                      name={getActivityMetricName('distance')}
                      dot={{ fill: getActivityMetricColor('distance'), r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No activity data available</p>
              </div>
            )}
          </div>

          {/* Lifestyle Score Trend */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Lifestyle Score Timeline
              <span className="ml-3 text-sm font-normal text-gray-600">
                Average: {stats.overview.averageLifestyleScore}/100
              </span>
            </h3>
            {stats.lifestyleScoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.lifestyleScoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No lifestyle score data available</p>
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Workout Types Breakdown with Dropdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-orange-500" />
                  Workout Analysis
                </h3>
                <select
                  value={workoutMetric}
                  onChange={(e) => setWorkoutMetric(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="count">Count</option>
                  <option value="duration">Time Spent (min)</option>
                  <option value="calories">Calories Burned</option>
                </select>
              </div>
              {stats.workoutBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWorkoutChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="type" 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      angle={0}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      label={{ 
                        value: getWorkoutYAxisLabel(), 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: '12px', fill: '#6b7280' }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => {
                        if (workoutMetric === 'duration') return `${value} min`;
                        if (workoutMetric === 'calories') return `${value} kcal`;
                        return value;
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {getWorkoutChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">No workout data available</p>
                </div>
              )}
            </div>

            {/* Goal Categories Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Goal Categories
              </h3>
              {stats.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.category} (${entry.count})`}
                      labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">No goal data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Nutrition Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UtensilsCrossed className="w-5 h-5 mr-2 text-green-500" />
                Nutrition
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Consumed</span>
                  <span className="font-bold text-gray-900">
                    {stats.nutritionSummary.totalConsumed?.toLocaleString()} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Burned</span>
                  <span className="font-bold text-gray-900">
                    {stats.nutritionSummary.totalBurned?.toLocaleString()} kcal
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Calories</span>
                    <span
                      className={`font-bold ${
                        stats.nutritionSummary.netCalories > 0
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {stats.nutritionSummary.netCalories > 0 ? '+' : ''}
                      {stats.nutritionSummary.netCalories?.toLocaleString()} kcal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Moon className="w-5 h-5 mr-2 text-indigo-500" />
                Sleep
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {stats.overview.averageSleep}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average hours/night</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recommended</span>
                    <span className="font-semibold text-gray-900">7-9 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hydration Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-cyan-500" />
                Hydration
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {stats.overview.averageWater}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average liters/day</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Goal</span>
                    <span className="font-semibold text-gray-900">2-3 liters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Statistics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Goal Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.goalStats?.total || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.goalStats?.active || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Active</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {stats.goalStats?.completed || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {stats.goalStats?.abandoned || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Abandoned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {stats.goalStats?.completionRate || 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Success Rate</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Statistics;