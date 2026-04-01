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
  const [isDeleting, setIsDeleting] = useState(false);
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

      if (addToValue !== '') {
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
        if (response.pointsAwarded) {
          let message = `🎉 Goal Auto-Completed!\n\n`;
          message += `Points Earned: ${response.pointsAwarded}\n`;
          message += `Total Points: ${response.totalPoints}`;

          if (response.levelUp) {
            message += `\n\n🌟 ${response.levelUp.message} 🌟`;
          }

          setSuccess(message);

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
        const {
          pointsAwarded,
          previousPoints,
          totalPoints,
          pointsBreakdown,
          levelUp,
        } = response.data;

        // Build success message with breakdown
        let message = '🎉 Goal Completed!\n\n';
        message += '━━━━━━━━━━━━━━━━━━━━\n';
        message += 'POINTS BREAKDOWN:\n';
        message += '━━━━━━━━━━━━━━━━━━━━\n\n';

        if (pointsBreakdown.details) {
          pointsBreakdown.details.forEach((detail) => {
            message += `• ${detail.label}: +${detail.value}\n`;
          });
        }

        message += '\n━━━━━━━━━━━━━━━━━━━━\n';
        message += `Total Earned: ${pointsAwarded} points\n`;
        message += `Previous Total: ${previousPoints} pts\n`;
        message += `New Total: ${totalPoints} pts\n`;
        message += '━━━━━━━━━━━━━━━━━━━━';

        if (levelUp) {
          message += `\n\n🌟 ${levelUp.message} 🌟`;
          message += `\n(${levelUp.previousLevel} → ${levelUp.newLevel})`;
        }

        setSuccess(message);
        setGoal(response.data.goal);

        // Refresh user data to update navbar
        await refreshUser();

        // Redirect after 4 seconds
        setTimeout(() => {
          navigate('/goals');
        }, 4000);
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
    // Prevent double-clicking
    if (isDeleting) {
      console.log('⚠️ Already deleting, ignoring duplicate call');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) 
      return;

    setIsDeleting(true);
    console.log('🗑️ Starting delete process...');
    
    setUpdating(true);
    setError('');

    try {
      const response = await goalService.deleteGoal(id);
      console.log('✅ Delete response:', response);

      if (response.success) {
        if (response.data.pointsDeducted) {
          console.log('💰 Points deducted:', response.data.pointsDeducted);
          
          const message = `Goal deleted!\n\nPoints deducted: ${response.data.pointsDeducted}\nNew total: ${response.data.newPoints} pts`;
          
          if (response.data.levelChanged) {
            alert(`${message}\n\nLevel changed: ${response.data.previousLevel} → ${response.data.newLevel}`);
          } else {
            alert(message);
          }

          // Refresh user data
          await refreshUser();
        }

        // Navigate
        navigate('/goals');
      }
    } catch (err) {
      console.error('❌ Delete goal error:', err);
      setError(err.response?.data?.message || 'Failed to delete goal');
      setUpdating(false);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-muted-dark">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-dark">Goal not found</p>
          <Link to="/goals" className="text-primary-500 dark:text-primary-400 hover:underline mt-2 inline-block">
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
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'Not Started':
        return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300';
      case 'Abandoned':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-6 py-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {success}
              </pre>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/goals"
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
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
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-semibold disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete</span>
                </button>
              )}
              <button
                onClick={handleDeleteGoal}
                disabled={updating}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
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
              <div className="card-dark rounded-xl shadow-dark p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                      <h2 className="text-2xl font-bold text-dark">
                        {goal.title}
                      </h2>
                    </div>
                    <p className="text-muted-dark">{goal.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>

                {/* Category and Date */}
                <div className="flex items-center space-x-4 text-sm text-muted-dark">
                  <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full font-medium">
                    {goal.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Due: {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  {daysRemaining >= 0 ? (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      {daysRemaining} days left
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {Math.abs(daysRemaining)} days overdue
                    </span>
                  )}
                </div>

                {/* Motivation Quote */}
                {goal.motivationQuote && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary-500 dark:border-primary-400 rounded">
                    <p className="text-gray-700 dark:text-dark-text italic">"{goal.motivationQuote}"</p>
                  </div>
                )}
              </div>

              {/* Progress Section */}
              <div className="card-dark rounded-xl shadow-dark p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  Progress Tracking
                </h3>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark">
                      Current Progress
                    </span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-hover rounded-full h-4">
                    <div
                      className="bg-primary-500 dark:bg-primary-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-dark">
                    <span>{goal.currentValue} {goal.unit}</span>
                    <span>{goal.targetValue} {goal.unit}</span>
                  </div>
                </div>

                {/* Update Progress Form */}
                {goal.status !== 'Completed' && goal.status !== 'Abandoned' && (
                  <form onSubmit={handleUpdateProgress} className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border-dark">
                      <p className="text-sm font-medium text-dark mb-3">
                        Update Your Progress
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-muted-dark mb-2">
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
                            className="input-dark w-full px-3 py-2 rounded-lg focus:ring-2 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-muted-dark mb-2">
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
                            className="input-dark w-full px-3 py-2 rounded-lg focus:ring-2 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="btn-primary-dark mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50"
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
                <div className="card-dark rounded-xl shadow-dark p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">
                    Rewards 🎁
                  </h3>
                  <ul className="space-y-2">
                    {goal.rewards.map((reward, index) => (
                      <li key={index} className="flex items-center space-x-2 text-dark">
                        <span className="text-green-500 dark:text-green-400">✓</span>
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
              <div className="card-dark rounded-xl shadow-dark p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  Goal Statistics
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-dark">Progress</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{goal.progress}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-dark">Current</span>
                    <span className="font-semibold text-dark">
                      {goal.currentValue} {goal.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-dark">Target</span>
                    <span className="font-semibold text-dark">
                      {goal.targetValue} {goal.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-dark">Remaining</span>
                    <span className="font-semibold text-dark">
                      {(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit}
                    </span>
                  </div>

                  <div className="pt-4 divider-dark">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-dark">Points</span>
                      <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                        <Award className="w-4 h-4" />
                        <span className="font-bold">{goal.points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="card-dark rounded-xl shadow-dark p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">
                  Timeline
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-dark">Started</p>
                    <p className="font-semibold text-dark">
                      {new Date(goal.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-dark">Target Date</p>
                    <p className="font-semibold text-dark">
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>

                  {goal.completedDate && (
                    <div>
                      <p className="text-muted-dark">Completed</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {new Date(goal.completedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-dark">Last Updated</p>
                    <p className="font-semibold text-dark">
                      {new Date(goal.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              {goal.status !== 'Completed' && goal.status !== 'Abandoned' && (
                <div className="card-dark rounded-xl shadow-dark p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">
                    Actions
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={handleCompleteGoal}
                      disabled={updating}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Complete</span>
                    </button>

                    <button
                      onClick={handleAbandonGoal}
                      disabled={updating}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50"
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