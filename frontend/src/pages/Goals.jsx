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
import Layout from '../components/Layout';

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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-muted-dark">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Header */}
        <header className="bg-white dark:bg-dark-card shadow-sm dark:shadow-lg border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-dark">My Goals</h1>
                <p className="text-muted-dark mt-1">
                  Track and achieve your fitness goals
                </p>
              </div>
              <Link
                to="/goals/create"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 font-semibold"
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
              <div className="card-dark rounded-xl shadow-dark p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-green-500 dark:text-green-400" />
                  <span className="text-2xl font-bold text-dark">{stats.total}</span>
                </div>
                <p className="text-muted-dark text-sm font-medium">Total Goals</p>
              </div>

              <div className="card-dark rounded-xl shadow-dark p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400" />
                  <span className="text-2xl font-bold text-dark">{stats.active}</span>
                </div>
                <p className="text-muted-dark text-sm font-medium">Active Goals</p>
              </div>

              <div className="card-dark rounded-xl shadow-dark p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
                  <span className="text-2xl font-bold text-dark">{stats.completed}</span>
                </div>
                <p className="text-muted-dark text-sm font-medium">Completed</p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  {stats.completionRate}% success rate
                </p>
              </div>

              <div className="card-dark rounded-xl shadow-dark p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-green-500 dark:text-green-400" />
                  <span className="text-2xl font-bold text-dark">{stats.totalPointsEarned}</span>
                </div>
                <p className="text-muted-dark text-sm font-medium">Points Earned</p>
              </div>
            </div>
          )}

          {/* Upcoming Deadlines Alert */}
          {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-1">
                    {stats.upcomingDeadlines.map((deadline) => (
                      <p key={deadline.goalId} className="text-sm text-green-700 dark:text-green-300">
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
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Overdue Goals
                  </h3>
                  <div className="space-y-1">
                    {stats.overdueGoals.map((overdue) => (
                      <p key={overdue.goalId} className="text-sm text-green-700 dark:text-green-300">
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
          <div className="card-dark rounded-xl shadow-dark p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-5 h-5 text-muted-dark" />
              <h3 className="font-semibold text-dark">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      filter === 'all'
                        ? 'bg-green-500 dark:bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    All ({goals.length})
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      filter === 'active'
                        ? 'bg-green-500 dark:bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    Active ({stats?.active || 0})
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      filter === 'completed'
                        ? 'bg-green-500 dark:bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    Completed ({stats?.completed || 0})
                  </button>
                  <button
                    onClick={() => setFilter('abandoned')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      filter === 'abandoned'
                        ? 'bg-green-500 dark:bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    Abandoned ({stats?.abandoned || 0})
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="select-dark w-full px-4 py-2 rounded-lg focus:ring-2 outline-none"
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
            <div className="card-dark rounded-xl shadow-dark p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 dark:text-dark-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark mb-2">
                No goals found
              </h3>
              <p className="text-muted-dark mb-6">
                {filter === 'all' 
                  ? "Start your fitness journey by creating your first goal!"
                  : `No ${filter} goals. Try a different filter.`}
              </p>
              <Link
                to="/goals/create"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Goal</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Goals;