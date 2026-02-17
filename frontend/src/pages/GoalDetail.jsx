import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/api';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update progress form
  const [progressValue, setProgressValue] = useState('');
  const [addToValue, setAddToValue] = useState('');

  // Fetch goal details
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        setLoading(true);
        const response = await goalService.getGoalById(id);
        setGoal(response.data);
        setProgressValue(response.data.currentValue || '');
      } catch (err) {
        console.error('Error fetching goal:', err);
        setError('Failed to load goal details');
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  // Update progress
  const handleUpdateProgress = async (e) => {
  e.preventDefault();
  setUpdating(true);
  setError('');
  setSuccess('');

  try {
    let updateData = {};

    if (addToValue) {
      updateData.addToValue = parseFloat(addToValue);
    } else if (progressValue !== '') {
      updateData.currentValue = parseFloat(progressValue);
    } else {
      setError('Please enter a value');
      setUpdating(false);
      return;
    }

    const response = await goalService.updateProgress(id, updateData);

    if (response.success) {
      const updatedGoal = response.data;
      setGoal(updatedGoal);
      setProgressValue(updatedGoal.currentValue);
      setAddToValue('');

      // Check if goal was auto-completed
      if (updatedGoal.status === 'Completed') {
        setSuccess(
          `🎉 Goal auto-completed! Points awarded: ${updatedGoal.points}`
        );
        // Refresh user to update points in navbar
        await refreshUser();
        // Redirect after 2.5 seconds
        setTimeout(() => navigate('/goals'), 2500);
      } else {
        setSuccess(
          `✅ Progress updated! ${updatedGoal.currentValue} / ${updatedGoal.targetValue} ${updatedGoal.unit}`
        );
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  } catch (err) {
    console.error('Update progress error:', err);
    setError(err.response?.data?.message || 'Failed to update progress');
  } finally {
    setUpdating(false);
  }
};
  // Complete goal
        const handleCompleteGoal = async () => {
        if (!window.confirm('Mark this goal as completed?')) return;

        setUpdating(true);
        setError('');

        try {
          const response = await goalService.completeGoal(id);
          
          if (response.success) {
            // Show success with points earned
            setSuccess(
              `🎉 Goal completed! You earned ${response.data.pointsAwarded} points! Total: ${response.data.totalPoints} points`
            );
            setGoal(response.data.goal);

            // Refresh user data so navbar/profile shows new points
            await refreshUser();

            // Redirect after 2.5 seconds
            setTimeout(() => {
              navigate('/goals');
            }, 2500);
          }
        } catch (err) {
          console.error('Complete goal error:', err);
          setError(err.response?.data?.message || 'Failed to complete goal');
        } finally {
          setUpdating(false);
        }
      };

  // Abandon goal
  const handleAbandonGoal = async () => {
    if (!window.confirm('Are you sure you want to abandon this goal?')) return;

    setUpdating(true);
    setError('');

    try {
      const response = await goalService.abandonGoal(id);
      
      if (response.success) {
        setSuccess('Goal marked as abandoned');
        setGoal(response.data);
      }
    } catch (err) {
      console.error('Abandon goal error:', err);
      setError(err.response?.data?.message || 'Failed to abandon goal');
    } finally {
      setUpdating(false);
    }
  };

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) return;

    setUpdating(true);
    setError('');

    try {
      await goalService.deleteGoal(id);
      navigate('/goals');
    } catch (err) {
      console.error('Delete goal error:', err);
      setError(err.response?.data?.message || 'Failed to delete goal');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Goal not found</p>
          <Link to="/goals" className="text-primary-500 hover:underline mt-2 inline-block">
            Back to Goals
          </Link>
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'Abandoned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/goals"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Goals
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {goal.status !== 'Completed' && goal.status !== 'Abandoned' && (
              <button
                onClick={handleCompleteGoal}
                disabled={updating}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete</span>
              </button>
            )}
            <button
              onClick={handleDeleteGoal}
              disabled={updating}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              title="Delete Goal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Goal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-6 h-6 text-primary-500" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {goal.title}
                    </h2>
                  </div>
                  <p className="text-gray-600">{goal.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </span>
              </div>

              {/* Category and Date */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                  {goal.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                </div>
                {daysRemaining >= 0 ? (
                  <span className="text-orange-600 font-medium">
                    {daysRemaining} days left
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    {Math.abs(daysRemaining)} days overdue
                  </span>
                )}
              </div>

              {/* Motivation Quote */}
              {goal.motivationQuote && (
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-primary-500 rounded">
                  <p className="text-gray-700 italic">"{goal.motivationQuote}"</p>
                </div>
              )}
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Progress Tracking
              </h3>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Current Progress
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                  <span>{goal.currentValue} {goal.unit}</span>
                  <span>{goal.targetValue} {goal.unit}</span>
                </div>
              </div>

              {/* Update Progress Form */}
              {goal.status !== 'Completed' && goal.status !== 'Abandoned' && (
                <form onSubmit={handleUpdateProgress} className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Update Your Progress
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Set Current Value
                        </label>
                        <input
                          type="number"
                          value={progressValue}
                          onChange={(e) => {
                            setProgressValue(e.target.value);
                            setAddToValue('');
                          }}
                          placeholder={`Current: ${goal.currentValue}`}
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Or Add to Current
                        </label>
                        <input
                          type="number"
                          value={addToValue}
                          onChange={(e) => {
                            setAddToValue(e.target.value);
                            setProgressValue('');
                          }}
                          placeholder="e.g., +5"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{updating ? 'Updating...' : 'Update Progress'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Rewards */}
            {goal.rewards && goal.rewards.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rewards 🎁
                </h3>
                <ul className="space-y-2">
                  {goal.rewards.map((reward, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>{reward}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Goal Statistics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-primary-600">{goal.progress}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current</span>
                  <span className="font-semibold text-gray-900">
                    {goal.currentValue} {goal.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Target</span>
                  <span className="font-semibold text-gray-900">
                    {goal.targetValue} {goal.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold text-gray-900">
                    {(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Points</span>
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Award className="w-4 h-4" />
                      <span className="font-bold">{goal.points}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Started</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(goal.startDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Target Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>

                {goal.completedDate && (
                  <div>
                    <p className="text-gray-600">Completed</p>
                    <p className="font-semibold text-green-600">
                      {new Date(goal.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(goal.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {goal.status !== 'Completed' && goal.status !== 'Abandoned' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={handleCompleteGoal}
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Complete</span>
                  </button>

                  <button
                    onClick={handleAbandonGoal}
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Abandon Goal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
};

export default GoalDetail;