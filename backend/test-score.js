const mongoose = require('mongoose');

// Mock for mongoose model
const mockUser = {
  targetSteps: 10000,
  targetCalories: 2000,
  targetSleep: 8
};

// Simplified mock of the FitnessLog logic
const calculateScore = (log) => {
  let score = 0;
  const targets = {
    steps: 10000,
    calories: 2000,
    sleep: 8,
    water: 3
  };

  // 1. Activity (35 pts)
  const steps = Number(log.steps) || 0;
  const stepScore = Math.min((steps / targets.steps) * 10, 10);
  
  let workoutScore = 0;
  const workouts = log.workouts || [];
  if (workouts.length > 0) {
    workoutScore += 10;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    if (totalDuration >= 45) workoutScore += 10;
    else if (totalDuration > 0) workoutScore += (totalDuration / 45) * 10;

    const hasHighIntensity = workouts.some(w => w.intensity === 'High');
    if (hasHighIntensity) workoutScore += 5;
  }
  score += stepScore + workoutScore;

  // 2. Nutrition (25 pts)
  const mandatoryMeals = ['Breakfast', 'Lunch', 'Dinner'];
  const loggedTypes = (log.meals || [])
    .filter(m => mandatoryMeals.includes(m.mealType))
    .map(m => m.mealType);
  const uniqueLoggedCount = new Set(loggedTypes).size;
  const mealLoggedScore = (uniqueLoggedCount / 3) * 5;
  
  let calorieScore = 0;
  const caloriesConsumed = Number(log.totalCaloriesConsumed) || 0;
  if (caloriesConsumed > 0) {
    const calDiff = Math.abs(caloriesConsumed - targets.calories);
    const calPercentOff = (calDiff / targets.calories) || 0;
    calorieScore = Math.max(10 - (calPercentOff * 15), 0);
  }

  let qualityScore = 0;
  if (log.meals && log.meals.length > 0) {
    const totalRating = log.meals.reduce((sum, m) => sum + (m.healthRating || 3), 0);
    const avgRating = totalRating / log.meals.length;
    qualityScore = (avgRating / 5) * 10;
  }
  score += mealLoggedScore + calorieScore + qualityScore;

  // 3. Hydration (15 pts)
  const water = Number(log.waterIntake) || 0;
  score += Math.min((water / targets.water) * 15, 15);

  // 4. Sleep (15 pts)
  if (log.sleep && Number(log.sleep.hours) > 0) {
    const sleepDiff = Math.abs(Number(log.sleep.hours) - targets.sleep);
    score += Math.max(15 - (sleepDiff * 3), 0);
  }

  // 5. Wellness (10 pts)
  const stress = Number(log.stressLevel) || 5; 
  score += Math.max(5 - (stress / 2), 0);
  const moodMap = { 'Excellent': 5, 'Good': 4, 'Neutral': 2.5, 'Bad': 1, 'Very Bad': 0 };
  score += moodMap[log.mood] || 0;

  // 6. Completion Bonus (5 pts)
  if (log.lifestyleLogCompleted && workouts.length > 0) {
    score += 5;
  }

  return Math.min(100, Math.round(score));
};

// TEST CASE: Screenshot values
const testLog = {
  steps: 1848,
  workouts: [
    { type: 'Walking', duration: 60, intensity: 'Moderate' },
    { type: 'Sports', duration: 90, intensity: 'High' }
  ],
  meals: [
    { mealType: 'Breakfast', healthRating: 4, calories: 200 },
    { mealType: 'Lunch', healthRating: 4, calories: 500 },
    { mealType: 'Dinner', healthRating: 4, calories: 400 },
    { mealType: 'Snack', healthRating: 3, calories: 150 }
  ],
  totalCaloriesConsumed: 1250,
  waterIntake: 3,
  sleep: { hours: 8 },
  stressLevel: 3,
  mood: 'Good',
  lifestyleLogCompleted: true
};

const result = calculateScore(testLog);
console.log('--- SCORE VERIFICATION ---');
console.log('Result Score:', result);
if (result >= 80 && result <= 90) {
  console.log('✅ TEST PASSED: Score is in 80-90 range.');
} else {
  console.log('❌ TEST FAILED: Score is', result);
}
