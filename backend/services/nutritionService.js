const CALORIE_NINJA_KEY = process.env.CALORIE_NINJA_KEY;

const FALLBACK_NUTRITION = {
  apple: { calories: 95, sugar_g: 19, protein_g: 0.5, fiber_g: 4.4, saturated_fat_g: 0.1 },
  banana: { calories: 105, sugar_g: 14, protein_g: 1.3, fiber_g: 3.1, saturated_fat_g: 0.1 },
  orange: { calories: 62, sugar_g: 12, protein_g: 1.2, fiber_g: 3.1, saturated_fat_g: 0.1 },
  rice: { calories: 205, sugar_g: 0.1, protein_g: 4.3, fiber_g: 0.6, saturated_fat_g: 0.1 },
  pasta: { calories: 220, sugar_g: 0.8, protein_g: 8.1, fiber_g: 2.5, saturated_fat_g: 0.2 },
  chicken: { calories: 239, sugar_g: 0, protein_g: 27, fiber_g: 0, saturated_fat_g: 3.8 },
  salad: { calories: 152, sugar_g: 3, protein_g: 5, fiber_g: 4, saturated_fat_g: 2 },
  sandwich: { calories: 361, sugar_g: 5, protein_g: 17, fiber_g: 3, saturated_fat_g: 4.5 },
  burger: { calories: 540, sugar_g: 9, protein_g: 34, fiber_g: 3, saturated_fat_g: 10 },
  pizza: { calories: 285, sugar_g: 3.6, protein_g: 12.2, fiber_g: 2.5, saturated_fat_g: 4.8 },
  fries: { calories: 365, sugar_g: 0.5, protein_g: 4, fiber_g: 3.8, saturated_fat_g: 2.3 },
  soda: { calories: 150, sugar_g: 39, protein_g: 0, fiber_g: 0, saturated_fat_g: 0 },
  juice: { calories: 110, sugar_g: 23, protein_g: 1.5, fiber_g: 0.5, saturated_fat_g: 0 },
  coffee: { calories: 5, sugar_g: 0, protein_g: 0.5, fiber_g: 0, saturated_fat_g: 0 },
  tea: { calories: 5, sugar_g: 0, protein_g: 0, fiber_g: 0, saturated_fat_g: 0 },
  yogurt: { calories: 150, sugar_g: 11, protein_g: 5, fiber_g: 0, saturated_fat_g: 5 },
  eggs: { calories: 78, sugar_g: 0.6, protein_g: 6, fiber_g: 0, saturated_fat_g: 1.6 },
  cereal: { calories: 140, sugar_g: 12, protein_g: 2.5, fiber_g: 1.5, saturated_fat_g: 0.5 },
  toast: { calories: 75, sugar_g: 1.5, protein_g: 2.5, fiber_g: 1, saturated_fat_g: 0.2 },
  smoothie: { calories: 180, sugar_g: 30, protein_g: 4, fiber_g: 5, saturated_fat_g: 0.5 },
};

const getFallbackNutrition = (foodName) => {
  const normalized = String(foodName).trim().toLowerCase();

  for (const [key, value] of Object.entries(FALLBACK_NUTRITION)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Absolute baseline fallback if no keyword matches
  return {
    calories: 250,
    sugar_g: 5,
    protein_g: 5,
    fiber_g: 2,
    saturated_fat_g: 2
  };
};

const getNutritionData = async (query) => {
  if (!query || !String(query).trim()) {
    throw new Error('Food name/query is required to estimate nutrition.');
  }

  const cleanedQuery = String(query).trim();

  // If global fetch isn't available (Node < 18), we might need a polyfill, but assuming MERN stack uses modern Node
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available. Please ensure Node 18+ is used.');
  }

  if (!CALORIE_NINJA_KEY) {
    console.warn('CALORIE_NINJA_KEY is not set. Using fallback offline dictionary.');
    return getFallbackNutrition(cleanedQuery);
  }

  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(cleanedQuery)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': CALORIE_NINJA_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`CalorieNinjas API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // API Ninjas returns an array directly, whereas CalorieNinjas used to return { items: [...] }
    const items = Array.isArray(data) ? data : (data.items || []);

    if (items.length > 0) {
      const aggregated = items.reduce((acc, item) => {
        acc.calories += parseFloat(item.calories) || 0;
        acc.sugar_g += parseFloat(item.sugar_g) || 0;
        acc.protein_g += parseFloat(item.protein_g) || 0;
        acc.fiber_g += parseFloat(item.fiber_g) || 0;
        acc.saturated_fat_g += parseFloat(item.fat_saturated_g) || 0; // Note: CalorieNinjas key is fat_saturated_g
        return acc;
      }, {
        calories: 0,
        sugar_g: 0,
        protein_g: 0,
        fiber_g: 0,
        saturated_fat_g: 0
      });

      return {
        calories: Math.round(aggregated.calories),
        sugar_g: Math.round(aggregated.sugar_g * 10) / 10,
        protein_g: Math.round(aggregated.protein_g * 10) / 10,
        fiber_g: Math.round(aggregated.fiber_g * 10) / 10,
        saturated_fat_g: Math.round(aggregated.saturated_fat_g * 10) / 10
      };
    }

    // No items returned by API
    console.warn('CalorieNinjas returned no items for query:', cleanedQuery);
    return getFallbackNutrition(cleanedQuery);

  } catch (error) {
    console.warn('Failed to fetch from CalorieNinjas, using fallback:', error.message);
    return getFallbackNutrition(cleanedQuery);
  }
};

module.exports = {
  getNutritionData,
  getFallbackNutrition
};
