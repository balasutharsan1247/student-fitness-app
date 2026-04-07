import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fitnessService } from '../services/api';
import Layout from '../components/Layout';
import GoogleFitConnect from '../components/GoogleFitConnect';

import {
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Save,
  Trash2,
  AlertCircle,
  Footprints,
  Lock,
  Moon
} from 'lucide-react';

const LogActivity = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [workouts, setWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState({ type: '', duration: '' });

  const [hydration, setHydration] = useState('');
  const [sleep, setSleep] = useState({ hours: '', quality: 'Good' });

  const [meals, setMeals] = useState({
    morning: '',
    afternoon: '',
    dinner: '',
    snacks: '',
  });

  // Google Fit data (read-only for display)
  const [fitData, setFitData] = useState({
    steps: 0,
    distance: 0,
    activeMinutes: 0,
    caloriesBurned: 0
  });

  // Load today's log if exists for "Edit" functionality
  useEffect(() => {
    const loadTodayLog = async () => {
      try {
        const response = await fitnessService.getTodayLog();
        if (response.success) {
          const log = response.data;

          // Map backend meals to our 4 categories
          const mealMap = { morning: '', afternoon: '', dinner: '', snacks: '' };
          log.meals?.forEach(m => {
            if (m.mealType === 'Breakfast') mealMap.morning = m.description;
            if (m.mealType === 'Lunch') mealMap.afternoon = m.description;
            if (m.mealType === 'Dinner') mealMap.dinner = m.description;
            if (m.mealType === 'Snack') mealMap.snacks = m.description;
          });

          setMeals(mealMap);
          setHydration(log.waterIntake || '');
          setWorkouts(log.workouts || []);
          if (log.sleep) {
            setSleep({
              hours: log.sleep.hours || '',
              quality: log.sleep.quality || 'Good'
            });
          }

          setFitData({
            steps: log.steps || 0,
            distance: log.distance || 0,
            activeMinutes: log.activeMinutes || 0,
            caloriesBurned: log.caloriesBurned || 0
          });
        }
      } catch (err) {
        console.log('No log for today');
      }
    };

    loadTodayLog();
  }, []);

  const handleClear = () => {
    setWorkouts([]);
    setHydration('');
    setSleep({ hours: '', quality: 'Good' });
    setMeals({ morning: '', afternoon: '', dinner: '', snacks: '' });
    setError('');
  };

  const addWorkout = () => {
    if (!currentWorkout.type || !currentWorkout.duration) return;
    setWorkouts([...workouts, { ...currentWorkout, duration: parseInt(currentWorkout.duration) }]);
    setCurrentWorkout({ type: '', duration: '' });
  };

  const removeWorkout = (index) => {
    setWorkouts(workouts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Prepare backend payload
      const formattedMeals = [];
      if (meals.morning) formattedMeals.push({ mealType: 'Breakfast', description: meals.morning });
      if (meals.afternoon) formattedMeals.push({ mealType: 'Lunch', description: meals.afternoon });
      if (meals.dinner) formattedMeals.push({ mealType: 'Dinner', description: meals.dinner });
      if (meals.snacks) formattedMeals.push({ mealType: 'Snack', description: meals.snacks });

      const logData = {
        source: 'manual',
        verificationStatus: 'self_reported',
        waterIntake: hydration ? parseFloat(hydration) : 0,
        sleep: {
          hours: sleep.hours ? parseFloat(sleep.hours) : 0,
          quality: sleep.quality
        },
        workouts: workouts,
        meals: formattedMeals,
        // Carry over fit data if available
        steps: fitData.steps,
        distance: fitData.distance,
        activeMinutes: fitData.activeMinutes,
      };

      const response = await fitnessService.createLog(logData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      console.error('Log activity error:', err);
      setError(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <main className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark mb-2">Daily Activity Log</h1>
            <p className="text-muted-dark">Track your workout, hydration, and nutrition for today.</p>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              ✅ Activity saved. Your Life Score is being updated!
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Google Fit Sync Section */}
          <div className="mb-8">
            <GoogleFitConnect
              onDataFetched={(data) => {
                setFitData({
                  steps: data.steps || 0,
                  distance: data.distance || 0,
                  activeMinutes: data.activeMinutes || 0,
                  caloriesBurned: data.calories || 0
                });
              }}
            />
            <div className="mt-4 p-4 card-dark rounded-xl border border-gray-200 dark:border-dark-border grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-dark uppercase font-bold mb-1">Steps</p>
                <p className="text-lg font-bold text-dark">{fitData.steps}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-dark uppercase font-bold mb-1">Active mins</p>
                <p className="text-lg font-bold text-dark">{fitData.activeMinutes}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-dark uppercase font-bold mb-1">Distance</p>
                <p className="text-lg font-bold text-dark">{fitData.distance.toFixed(1)} km</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-dark uppercase font-bold mb-1">Fit Calories</p>
                <p className="text-lg font-bold text-dark">{fitData.caloriesBurned}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Workout Section */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark">Workout</h2>
              </div>

              {/* Workout Input */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-1">
                  <select
                    value={currentWorkout.type}
                    onChange={(e) => setCurrentWorkout({ ...currentWorkout, type: e.target.value })}
                    className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Running">Running</option>
                    <option value="Walking">Walking</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Gym">Gym</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Sports">Sports</option>
                    <option value="Dancing">Dancing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <input
                    type="number"
                    value={currentWorkout.duration}
                    onChange={(e) => setCurrentWorkout({ ...currentWorkout, duration: e.target.value })}
                    placeholder="Duration (mins)"
                    min="0"
                    className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={addWorkout}
                  disabled={!currentWorkout.type || !currentWorkout.duration}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-bold"
                >
                  Add Workout
                </button>
              </div>

              {/* Workout List */}
              {workouts.length > 0 && (
                <div className="space-y-3">
                  {workouts.map((w, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-100 dark:border-dark-border">
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-dark">{w.type}</span>
                        <span className="text-sm text-muted-dark">{w.duration} minutes</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWorkout(index)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {workouts.length === 0 && (
                <p className="text-center text-sm text-muted-dark italic py-2">No workouts added yet</p>
              )}
            </div>

            {/* Hydration Section */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark">Hydration</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Water Intake (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hydration}
                  onChange={(e) => setHydration(e.target.value)}
                  placeholder="e.g. 2.5"
                  min="0"
                  className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none"
                />
              </div>
            </div>

            {/* Sleep Section */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark">Sleep</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Sleep Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleep.hours}
                    onChange={(e) => setSleep({ ...sleep, hours: e.target.value })}
                    placeholder="e.g. 8"
                    min="0"
                    max="24"
                    className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Sleep Quality</label>
                  <select
                    value={sleep.quality}
                    onChange={(e) => setSleep({ ...sleep, quality: e.target.value })}
                    className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none"
                  >
                    <option value="Poor">Poor</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Food Section */}
            <div className="card-dark rounded-xl shadow-dark p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark">Food Eaten</h2>
              </div>

              <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Tip for better accuracy:</span> Use portion sizes like <span className="font-semibold italic">"1 cup rice"</span> or <span className="font-semibold italic">"2 chapatis"</span> instead of just "rice".
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-dark mb-2 uppercase tracking-wide text-xs">Morning (Breakfast)</label>
                    <textarea
                      rows="3"
                      value={meals.morning}
                      onChange={(e) => setMeals({ ...meals, morning: e.target.value })}
                      placeholder="e.g. 1 cup oatmeal with berries"
                      className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none resize-none h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-dark mb-2 uppercase tracking-wide text-xs">Afternoon (Lunch)</label>
                    <textarea
                      rows="3"
                      value={meals.afternoon}
                      onChange={(e) => setMeals({ ...meals, afternoon: e.target.value })}
                      placeholder="e.g. 2 cups brown rice with lentil soup"
                      className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none resize-none h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-dark mb-2 uppercase tracking-wide text-xs">Evening (Dinner)</label>
                    <textarea
                      rows="3"
                      value={meals.dinner}
                      onChange={(e) => setMeals({ ...meals, dinner: e.target.value })}
                      placeholder="e.g. Mixed salad with grilled paneer"
                      className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none resize-none h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-dark mb-2 uppercase tracking-wide text-xs">Snacks & Others</label>
                    <textarea
                      rows="3"
                      value={meals.snacks}
                      onChange={(e) => setMeals({ ...meals, snacks: e.target.value })}
                      placeholder="e.g. 1 apple, 10 almonds"
                      className="w-full px-4 py-2 border border-dark input-dark rounded-lg outline-none resize-none h-24"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition font-semibold"
              >
                <Trash2 className="w-5 h-5" />
                <span>Clear Form</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto text-center px-6 py-3 border border-dark text-dark rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition font-semibold"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-bold shadow-lg shadow-green-200 dark:shadow-none disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Update Activity Log'}</span>
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </Layout>
  );
};

export default LogActivity;