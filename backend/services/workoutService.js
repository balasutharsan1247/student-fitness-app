const API_NINJA_KEY = process.env.API_NINJA_KEY || process.env.CALORIE_NINJA_KEY;

const MET_TABLE = {
  running: 9.8,
  walking: 3.8,
  cycling: 7.5,
  swimming: 8.0,
  gym: 6.0,
  yoga: 3.5,
  sports: 7.5,
  dancing: 5.0,
  other: 4.5
};

const DEFAULT_WEIGHT_KG = 70;

const normalizeActivityType = (type) => {
  if (!type || typeof type !== 'string') return 'other';
  const normalized = type.trim().toLowerCase();
  if (['run', 'jogging', 'jog'].includes(normalized)) return 'running';
  if (['walk', 'stroll'].includes(normalized)) return 'walking';
  if (['swim'].includes(normalized)) return 'swimming';
  if (['weights', 'weightlifting', 'bodybuilding', 'strength'].includes(normalized)) return 'gym';
  if (['bike', 'biking', 'cycle'].includes(normalized)) return 'cycling';
  return normalized;
};

/**
 * Fetch calorie burn data from API-Ninjas or use MET table fallback
 */
const calculateWorkoutData = async ({ type, duration, weight }) => {
  const durationMin = Number(duration) || 0;
  const weightKg = Number(weight) || DEFAULT_WEIGHT_KG;
  const normalizedType = normalizeActivityType(type);

  if (API_NINJA_KEY) {
    try {
      const weightLbs = Math.round(weightKg * 2.20462);
      const response = await fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${encodeURIComponent(normalizedType)}&weight=${weightLbs}&duration=${durationMin}`, {
        headers: { 'X-Api-Key': API_NINJA_KEY }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const match = data[0];
          return {
            type: match.name.charAt(0).toUpperCase() + match.name.slice(1),
            duration: durationMin,
            intensity: match.total_calories > 300 ? 'High' : (match.total_calories > 150 ? 'Moderate' : 'Low'),
            caloriesBurned: Math.round(match.total_calories),
            source: 'api'
          };
        }
      }
    } catch (error) {
      console.warn('Workout API failed, falling back to MET:', error.message);
    }
  }

  // Fallback to MET calculation
  const metValue = MET_TABLE[normalizedType] || MET_TABLE.other;
  const caloriesBurned = Math.round(metValue * weightKg * (durationMin / 60));
  
  return {
    type: normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1),
    duration: durationMin,
    intensity: metValue >= 7 ? 'High' : (metValue >= 4 ? 'Moderate' : 'Low'),
    caloriesBurned,
    source: 'met_calculation'
  };
};

module.exports = {
  MET_TABLE,
  calculateWorkoutData,
  normalizeActivityType
};

