import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { goalService } from '../services/api';
import { ArrowLeft, Target, Save } from 'lucide-react';
import Layout from '../components/Layout';

const CreateGoal = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        navigate('/goals');
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="mb-8">
          <Link
            to="/goals"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Goal</h1>
          <p className="text-gray-600 mt-1">
            Set a new fitness goal to achieve
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Goal Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Lose 5kg in 2 months"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your goal and why it's important to you"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Target & Progress
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="kg, steps, hours, km"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date *
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Motivation & Reminders
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivation Quote
                </label>
                <input
                  type="text"
                  name="motivationQuote"
                  value={formData.motivationQuote}
                  onChange={handleChange}
                  placeholder="e.g., Every journey begins with a single step!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  name="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700">
                  Enable reminders for this goal
                </label>
              </div>

              {formData.reminderEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Frequency
                  </label>
                  <select
                    name="reminderFrequency"
                    value={formData.reminderFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
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