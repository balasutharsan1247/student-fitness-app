import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { goalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Target, Save } from 'lucide-react';
import Layout from '../components/Layout';

const CreateGoal = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetValue: '',
    currentValue: '',
    unit: '',
    targetDate: '',
    motivationQuote: '',
    reminderEnabled: false,
    reminderFrequency: 'Weekly',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate
      if (!formData.title || !formData.category || !formData.targetValue || !formData.unit || !formData.targetDate) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data
      const goalData = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        targetValue: parseFloat(formData.targetValue),
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : 0,
        unit: formData.unit,
        targetDate: formData.targetDate,
        motivationQuote: formData.motivationQuote || undefined,
        reminderEnabled: formData.reminderEnabled,
        reminderFrequency: formData.reminderFrequency,
      };

      const response = await goalService.createGoal(goalData);

      if (response.success) {
        const createdGoal = response.data;
        
        // Check if goal was auto-completed (current = target)
        if (createdGoal.status === 'Completed' && createdGoal.points > 0) {
          // Goal auto-completed! Refresh user to get updated points
          await refreshUser();
          
          // Show success message
          setSuccess(`🎉 Goal auto-completed! You earned ${createdGoal.points} points!`);
          
          // Navigate after 2 seconds
          setTimeout(() => {
            navigate('/goals');
          }, 2000);
        } else {
          // Regular goal creation - navigate immediately
          navigate('/goals');
        }
      }
    } catch (err) {
      console.error('Create goal error:', err);
      setError(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="mb-8">
            <Link
              to="/goals"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Goals
            </Link>
            <h1 className="text-2xl font-bold text-dark">Create New Goal</h1>
            <p className="text-muted-dark mt-1">
              Set a new fitness goal to achieve
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-500 dark:bg-primary-600 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark">
                  Goal Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Lose 5kg in 2 months"
                    className="input-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your goal and why it's important to you"
                    rows="3"
                    className="textarea-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="select-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Steps">Steps</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Stress Management">Stress Management</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target & Progress */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <h3 className="text-lg font-semibold text-dark mb-4">
                Target & Progress
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Current Value
                  </label>
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="input-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    name="targetValue"
                    value={formData.targetValue}
                    onChange={handleChange}
                    placeholder="100"
                    min="0"
                    step="0.1"
                    className="input-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="kg, steps, hours, km"
                    className="input-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-dark mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  className="input-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                  required
                />
              </div>
            </div>

            {/* Motivation */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <h3 className="text-lg font-semibold text-dark mb-4">
                Motivation & Reminders
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Motivation Quote
                  </label>
                  <input
                    type="text"
                    name="motivationQuote"
                    value={formData.motivationQuote}
                    onChange={handleChange}
                    placeholder="e.g., Every journey begins with a single step!"
                    className="input-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="reminderEnabled"
                    name="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-500 focus:ring-primary-500 border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg"
                  />
                  <label htmlFor="reminderEnabled" className="text-sm font-medium text-dark">
                    Enable reminders for this goal
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Reminder Frequency
                    </label>
                    <select
                      name="reminderFrequency"
                      value={formData.reminderFrequency}
                      onChange={handleChange}
                      className="select-dark w-full px-4 py-3 rounded-lg focus:ring-2 outline-none"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <Link
                to="/goals"
                className="px-6 py-3 border-dark text-muted-dark hover-dark rounded-lg transition-colors duration-200 font-semibold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-dark flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-200 font-semibold disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Creating...' : 'Create Goal'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </Layout>
  );
};

export default CreateGoal;
