const calculateHealthRating = ({ totalGrams, sugar = 0, protein = 0, fiber = 0, saturatedFat = 0 }) => {
    if (!totalGrams || totalGrams <= 0) {
        return 3;
    }

    let score = 3;

    const sugarPer100g = (sugar / totalGrams) * 100;
    const satFatPer100g = (saturatedFat / totalGrams) * 100;
    const proteinPer100g = (protein / totalGrams) * 100;
    const fiberPer100g = (fiber / totalGrams) * 100;

    if (sugarPer100g > 15) score -= 1;
    if (satFatPer100g > 10) score -= 1;
    if (proteinPer100g > 10) score += 1;
    if (fiberPer100g > 3) score += 1;

    // Clamp between 1 and 5
    return Math.max(1, Math.min(5, score));
};

module.exports = calculateHealthRating;
