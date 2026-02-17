import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fitnessService } from '../services/api';
import Layout from '../components/Layout';
import { 
  Activity, 
  ArrowLeft, 
  Footprints, 
  Flame, 
  Dumbbell, 
  UtensilsCrossed,
  Moon,
  Droplets,
  Monitor,
  Smile,
  Scale,
  Save,
  Plus,
  X
} from 'lucide-react';

const LogActivity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    steps: '',
    distance: '',
    activeMinutes: '',
    caloriesBurned: '',
    waterIntake: '',
    screenTime: '',
    stressLevel: '',
    mood: '',
    weight: '',
    notes: '',
  });

  // Sleep data
  const [sleep, setSleep] = useState({
    hours: '',
    quality: '',
  });

  // Workouts array
  const [workouts, setWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState({
    type: '',
    duration: '',
    intensity: 'Moderate',
    caloriesBurned: '',
    notes: '',
  });

  // Meals array
  const [meals, setMeals] = useState([]);
  const [currentMeal, setCurrentMeal] = useState({
    mealType: '',
    description: '',
    calories: '',
    location: '',
    healthRating: '',
  });

  // Load today's log if exists
  useEffect(() => {
    const loadTodayLog = async () => {
      try {
        const response = await fitnessService.getTodayLog();
        if (response.success) {
          const log = response.data;
          setFormData({
            steps: log.steps || '',
            distance: log.distance || '',
            activeMinutes: log.activeMinutes || '',
            caloriesBurned: log.caloriesBurned || '',
            waterIntake: log.waterIntake || '',
            screenTime: log.screenTime || '',
            stressLevel: log.stressLevel || '',
            mood: log.mood || '',
            weight: log.weight || '',
            notes: log.notes || '',
          });
          setSleep({
            hours: log.sleep?.hours || '',
            quality: log.sleep?.quality || '',
          });
          setWorkouts(log.workouts || []);
          setMeals(log.meals || []);
        }
      } catch (err) {
        // No log for today yet - that's okay
        console.log('No log for today');
      }
    };

    loadTodayLog();
  }, []);

  // Handle basic input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Handle sleep input changes
  const handleSleepChange = (e) => {
    const { name, value } = e.target;
    setSleep(prev => ({ ...prev, [name]: value }));
  };

  // Add workout
  const addWorkout = () => {
    if (!currentWorkout.type || !currentWorkout.duration) {
      setError('Please fill in workout type and duration');
      return;
    }

    setWorkouts([...workouts, { ...currentWorkout }]);
    setCurrentWorkout({
      type: '',
      duration: '',
      intensity: 'Moderate',
      caloriesBurned: '',
      notes: '',
    });
    setError('');
  };

  // Remove workout
  const removeWorkout = (index) => {
    setWorkouts(workouts.filter((_, i) => i !== index));
  };

  // Add meal
  const addMeal = () => {
    if (!currentMeal.mealType || !currentMeal.description) {
      setError('Please fill in meal type and description');
      return;
    }

    setMeals([...meals, { ...currentMeal }]);
    setCurrentMeal({
      mealType: '',
      description: '',
      calories: '',
      location: '',
      healthRating: '',
    });
    setError('');
  };

  // Remove meal
  const removeMeal = (index) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  // Calculate total calories consumed
  const totalCaloriesConsumed = meals.reduce(
    (sum, meal) => sum + (parseFloat(meal.calories) || 0),
    0
  );

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Prepare data
      const logData = {
        steps: formData.steps ? parseInt(formData.steps) : undefined,
        distance: formData.distance ? parseFloat(formData.distance) : undefined,
        activeMinutes: formData.activeMinutes ? parseInt(formData.activeMinutes) : undefined,
        caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
        waterIntake: formData.waterIntake ? parseFloat(formData.waterIntake) : undefined,
        screenTime: formData.screenTime ? parseFloat(formData.screenTime) : undefined,
        stressLevel: formData.stressLevel ? parseInt(formData.stressLevel) : undefined,
        mood: formData.mood || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        notes: formData.notes || undefined,
        sleep: sleep.hours ? {
          hours: parseFloat(sleep.hours),
          quality: sleep.quality || undefined,
        } : undefined,
        workouts: workouts.length > 0 ? workouts.map(w => ({
          type: w.type,
          duration: parseInt(w.duration),
          intensity: w.intensity,
          caloriesBurned: w.caloriesBurned ? parseInt(w.caloriesBurned) : undefined,
          notes: w.notes || undefined,
        })) : undefined,
        meals: meals.length > 0 ? meals.map(m => ({
          mealType: m.mealType,
          description: m.description,
          calories: m.calories ? parseInt(m.calories) : undefined,
          location: m.location || undefined,
          healthRating: m.healthRating ? parseInt(m.healthRating) : undefined,
        })) : undefined,
        totalCaloriesConsumed: totalCaloriesConsumed || undefined,
      };

      // Remove undefined values
      Object.keys(logData).forEach(key => {
        if (logData[key] === undefined) {
          delete logData[key];
        }
      });

      const response = await fitnessService.createLog(logData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✅ Activity logged successfully! Redirecting to dashboard...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Physical Activity Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Physical Activity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps
                </label>
                <input
                  type="number"
                  name="steps"
                  value={formData.steps}
                  onChange={handleChange}
                  placeholder="10000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="5.5"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Minutes
                </label>
                <input
                  type="number"
                  name="activeMinutes"
                  value={formData.activeMinutes}
                  onChange={handleChange}
                  placeholder="30"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories Burned
                </label>
                <input
                  type="number"
                  name="caloriesBurned"
                  value={formData.caloriesBurned}
                  onChange={handleChange}
                  placeholder="300"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Workouts Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Workouts</h2>
            </div>

            {/* Existing workouts */}
            {workouts.length > 0 && (
              <div className="mb-6 space-y-3">
                {workouts.map((workout, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {workout.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {workout.duration} min • {workout.intensity}
                        {workout.caloriesBurned && ` • ${workout.caloriesBurned} cal`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWorkout(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new workout */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-gray-900">Add Workout</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={currentWorkout.type}
                    onChange={(e) =>
                      setCurrentWorkout({ ...currentWorkout, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={currentWorkout.duration}
                    onChange={(e) =>
                      setCurrentWorkout({ ...currentWorkout, duration: e.target.value })
                    }
                    placeholder="30"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity
                  </label>
                  <select
                    value={currentWorkout.intensity}
                    onChange={(e) =>
                      setCurrentWorkout({ ...currentWorkout, intensity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    value={currentWorkout.caloriesBurned}
                    onChange={(e) =>
                      setCurrentWorkout({
                        ...currentWorkout,
                        caloriesBurned: e.target.value,
                      })
                    }
                    placeholder="200"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={currentWorkout.notes}
                    onChange={(e) =>
                      setCurrentWorkout({ ...currentWorkout, notes: e.target.value })
                    }
                    placeholder="Morning jog around campus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addWorkout}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Workout</span>
              </button>
            </div>
          </div>

          {/* Meals Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-500 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Meals & Nutrition</h2>
            </div>

            {/* Existing meals */}
            {meals.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Total Calories: <span className="font-bold text-green-600">{totalCaloriesConsumed} kcal</span>
                  </p>
                </div>
                {meals.map((meal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {meal.mealType}
                      </p>
                      <p className="text-sm text-gray-600">
                        {meal.description}
                        {meal.calories && ` • ${meal.calories} cal`}
                        {meal.location && ` • ${meal.location}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMeal(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new meal */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-gray-900">Add Meal</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type *
                  </label>
                  <select
                    value={currentMeal.mealType}
                    onChange={(e) =>
                      setCurrentMeal({ ...currentMeal, mealType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={currentMeal.calories}
                    onChange={(e) =>
                      setCurrentMeal({ ...currentMeal, calories: e.target.value })
                    }
                    placeholder="500"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={currentMeal.description}
                    onChange={(e) =>
                      setCurrentMeal({ ...currentMeal, description: e.target.value })
                    }
                    placeholder="Oatmeal with fruits and coffee"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={currentMeal.location}
                    onChange={(e) =>
                      setCurrentMeal({ ...currentMeal, location: e.target.value })
                    }
                    placeholder="Campus Cafeteria"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Rating (1-5)
                  </label>
                  <select
                    value={currentMeal.healthRating}
                    onChange={(e) =>
                      setCurrentMeal({ ...currentMeal, healthRating: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Rating</option>
                    <option value="1">1 - Not Healthy</option>
                    <option value="2">2 - Below Average</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Healthy</option>
                    <option value="5">5 - Very Healthy</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={addMeal}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Meal</span>
              </button>
            </div>
          </div>

          {/* Sleep Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Sleep</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  name="hours"
                  value={sleep.hours}
                  onChange={handleSleepChange}
                  placeholder="7.5"
                  min="0"
                  max="24"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality
                </label>
                <select
                  name="quality"
                  value={sleep.quality}
                  onChange={handleSleepChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Quality</option>
                  <option value="Poor">Poor</option>
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Excellent">Excellent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifestyle Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Lifestyle & Wellness</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Intake (liters)
                </label>
                <input
                  type="number"
                  name="waterIntake"
                  value={formData.waterIntake}
                  onChange={handleChange}
                  placeholder="2.5"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screen Time (hours)
                </label>
                <input
                  type="number"
                  name="screenTime"
                  value={formData.screenTime}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10)
                </label>
                <input
                  type="number"
                  name="stressLevel"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1 = Very Relaxed, 10 = Extremely Stressed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood
                </label>
                <select
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Mood</option>
                  <option value="Very Bad">😞 Very Bad</option>
                  <option value="Bad">😕 Bad</option>
                  <option value="Neutral">😐 Neutral</option>
                  <option value="Good">🙂 Good</option>
                  <option value="Excellent">😄 Excellent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Additional Notes</h2>
            </div>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="How did you feel today? Any achievements or challenges?"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Activity Log'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
    </Layout>
  );
};

export default LogActivity;