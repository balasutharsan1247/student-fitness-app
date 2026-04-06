const HEALTH_RECOMMENDATION_RULES = {
  breathing_issues: {
    warningLevel: 'moderate',
    warningMessages: [
      'Take it easy with high-intensity workouts and focus on controlled breathing.',
    ],
    safeExercises: ['walking', 'yoga', 'swimming', 'cycling'],
    avoidExercises: ['high-intensity running', 'intense gym sessions', 'competitive sports'],
  },
  heart_restriction: {
    warningLevel: 'high',
    warningMessages: [
      'Avoid aggressive cardio and choose gentle movement to protect your heart.',
    ],
    safeExercises: ['walking', 'yoga', 'low-impact cycling'],
    avoidExercises: ['high-intensity cardio', 'sprinting', 'heavy interval training'],
  },
  joint_pain: {
    warningLevel: 'moderate',
    warningMessages: ['Avoid high-impact activities that may stress your joints.'],
    safeExercises: ['swimming', 'cycling', 'yoga', 'walking'],
    avoidExercises: ['high-impact activities', 'jumping exercises', 'intense running'],
  },
  diabetes_concern: {
    warningLevel: 'moderate',
    warningMessages: [
      'Keep hydrated and have a healthy snack ready for steady energy.',
    ],
    foodGuidance: [
      'Stay hydrated during activity.',
      'Choose balanced snacks to support stable blood sugar.',
    ],
  },
  doctor_exercise_limit: {
    warningLevel: 'moderate',
    warningMessages: [
      'Follow your doctor’s guidance and choose gentle movement.',
    ],
    safeExercises: ['walking', 'yoga'],
    avoidExercises: ['high-intensity exercise', 'vigorous cardio', 'heavy lifting'],
  },
  dietary_restriction: {
    warningLevel: 'none',
    warningMessages: [],
    foodGuidance: [
      'Choose foods that fit your dietary restrictions and keep meals balanced.',
      'Focus on nutrient-rich options that support overall wellness.',
    ],
  },
  vegetarian: {
    warningLevel: 'none',
    warningMessages: [],
    foodGuidance: [
      'Include a variety of vegetarian protein sources like beans, lentils, and tofu.',
    ],
  },
  vegan: {
    warningLevel: 'none',
    warningMessages: [],
    foodGuidance: [
      'Choose plant-based protein sources and consider vitamin B12-rich foods.',
      'Include fortified foods or supplements for B12 support.',
    ],
  },
};

const normalizeArray = (value) =>
  Array.isArray(value) ? [...new Set(value.filter(Boolean))] : [];

const mergeUnique = (items) => [...new Set(items.filter(Boolean))];

const getHighestWarningLevel = (levels) => {
  if (levels.includes('high')) return 'high';
  if (levels.includes('moderate')) return 'moderate';
  return 'none';
};

export function getHealthRecommendations(healthConsiderations = []) {
  const considerations = normalizeArray(healthConsiderations);
  const warningLevels = [];
  const warningMessages = [];
  const safeExercises = [];
  const avoidExercises = [];
  const foodGuidance = [];

  considerations.forEach((consideration) => {
    const rule = HEALTH_RECOMMENDATION_RULES[consideration];
    if (!rule) {
      return;
    }

    if (rule.warningLevel) {
      warningLevels.push(rule.warningLevel);
    }

    if (rule.warningMessages) {
      warningMessages.push(...rule.warningMessages);
    }

    if (rule.safeExercises) {
      safeExercises.push(...rule.safeExercises);
    }

    if (rule.avoidExercises) {
      avoidExercises.push(...rule.avoidExercises);
    }

    if (rule.foodGuidance) {
      foodGuidance.push(...rule.foodGuidance);
    }
  });

  return {
    warningLevel: getHighestWarningLevel(warningLevels),
    warningMessages: mergeUnique(warningMessages),
    safeExercises: mergeUnique(safeExercises),
    avoidExercises: mergeUnique(avoidExercises),
    foodGuidance: mergeUnique(foodGuidance),
  };
}
