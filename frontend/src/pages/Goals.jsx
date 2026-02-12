import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { goalService } from '../services/api';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Filter,
  Award,
  Calendar
} from 'lucide-react';
import GoalCard from '../components/GoalCard';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, abandoned
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch goals and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all goals
        const goalsResponse = await goalService.getAllGoals();
        setGoals(goalsResponse.data || []);
        setFilteredGoals(goalsResponse.data || []);

        // Fetch stats
        const statsResponse = await goalService.getGoalStats();
        setStats(statsResponse.data);
      } catch (err) {
        console.error('Error fetching goals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...goals];

    // Status filter
    if (filter === 'active') {
      filtered = filtered.filter(g => 
        g.status === 'In Progress' || g.status === 'Not Started'
      );
    } else if (filter === 'completed') {
      filtered = filtered.filter(g => g.status === 'Completed');
    } else if (filter === 'abandoned') {
      filtered = filtered.filter(g => g.status === 'Abandoned');
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }

    setFilteredGoals(filtered);
  }, [filter, categoryFilter, goals]);

  // Get unique categories
  const categories = ['all', ...new Set(goals.map(g => g.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
              <p className="text-gray-600 mt-1">
                Track and achieve your fitness goals
              </p>
            </div>
            <Link
              to="/goals/create"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Create Goal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Total Goals</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.active}</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Active Goals</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.completed}</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completionRate}% success rate
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalPointsEarned}</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Points Earned</p>
            </div>
          </div>
        )}

        {/* Upcoming Deadlines Alert */}
        {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Upcoming Deadlines
                </h3>
                <div className="space-y-1">
                  {stats.upcomingDeadlines.map((deadline) => (
                    <p key={deadline.goalId} className="text-sm text-yellow-800">
                      <span className="font-medium">{deadline.title}</span>
                      {' - '}
                      {deadline.daysRemaining === 0 ? 'Due today!' : `${deadline.daysRemaining} days left`}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Goals Alert */}
        {stats?.overdueGoals && stats.overdueGoals.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  Overdue Goals
                </h3>
                <div className="space-y-1">
                  {stats.overdueGoals.map((overdue) => (
                    <p key={overdue.goalId} className="text-sm text-red-800">
                      <span className="font-medium">{overdue.title}</span>
                      {' - '}
                      {overdue.daysOverdue} days overdue
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({goals.length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'active'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active ({stats?.active || 0})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'completed'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed ({stats?.completed || 0})
                </button>
                <button
                  onClick={() => setFilter('abandoned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === 'abandoned'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Abandoned ({stats?.abandoned || 0})
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <Link key={goal._id} to={`/goals/${goal._id}`}>
                <GoalCard goal={goal} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No goals found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "Start your fitness journey by creating your first goal!"
                : `No ${filter} goals. Try a different filter.`}
            </p>
            <Link
              to="/goals/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Goal</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Goals;