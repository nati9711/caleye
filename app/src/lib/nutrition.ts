/**
 * USDA FoodData Central API integration.
 *
 * The AI identifies food + estimates grams.
 * This module looks up REAL nutritional data from USDA's database.
 * Result: much more accurate calorie/macro calculations.
 */

const USDA_API_KEY = 'SpHZ0BZQGLORT8gTZWz9J1DOqO1Zzmubi1XqL6bp';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'usda' | 'ai_estimate';
  foodName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: {
    nutrientName: string;
    value: number;
    unitName: string;
  }[];
}

/**
 * Search USDA for a food item and return nutrition per the given grams.
 * Falls back to null if not found.
 */
export async function lookupNutrition(
  foodName: string,
  grams: number
): Promise<NutritionData | null> {
  try {
    // Search for the food
    const searchUrl = `${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(foodName)}&pageSize=1&dataType=SR Legacy,Foundation`;

    console.log(`[CalEye/USDA] 🔍 Searching: "${foodName}" (${grams}g)`);

    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.warn(`[CalEye/USDA] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const foods: USDAFood[] = data.foods || [];

    if (foods.length === 0) {
      console.warn(`[CalEye/USDA] No results for: "${foodName}"`);
      return null;
    }

    const food = foods[0]!;
    console.log(`[CalEye/USDA] ✅ Found: "${food.description}" (fdcId: ${food.fdcId})`);

    // Extract nutrients (USDA values are per 100g)
    // IMPORTANT: USDA returns Energy in BOTH kJ and KCAL — we need KCAL only!
    const caloriesPer100 = findNutrientExact(food.foodNutrients, 'Energy', 'KCAL') ?? 0;
    const proteinPer100 = findNutrient(food.foodNutrients, 'Protein') ?? 0;
    const carbsPer100 = findNutrient(food.foodNutrients, 'Carbohydrate, by difference') ?? 0;
    const fatPer100 = findNutrient(food.foodNutrients, 'Total lipid (fat)') ?? 0;

    // Scale to actual grams
    const scale = grams / 100;

    const result: NutritionData = {
      calories: Math.round(caloriesPer100 * scale),
      protein: Math.round(proteinPer100 * scale * 10) / 10,
      carbs: Math.round(carbsPer100 * scale * 10) / 10,
      fat: Math.round(fatPer100 * scale * 10) / 10,
      source: 'usda',
      foodName: food.description,
    };

    console.log(`[CalEye/USDA] 📊 ${grams}g → ${result.calories} cal, P:${result.protein}g C:${result.carbs}g F:${result.fat}g`);
    return result;
  } catch (err) {
    console.error('[CalEye/USDA] Lookup failed:', err);
    return null;
  }
}

function findNutrient(
  nutrients: { nutrientName: string; value: number }[],
  name: string
): number | null {
  const found = nutrients.find((n) =>
    n.nutrientName.toLowerCase().includes(name.toLowerCase())
  );
  return found ? found.value : null;
}

/** Find nutrient by name AND unit (critical for Energy — kJ vs KCAL) */
function findNutrientExact(
  nutrients: { nutrientName: string; unitName: string; value: number }[],
  name: string,
  unit: string
): number | null {
  const found = nutrients.find((n) =>
    n.nutrientName.toLowerCase().includes(name.toLowerCase()) &&
    n.unitName === unit
  );
  return found ? found.value : null;
}
