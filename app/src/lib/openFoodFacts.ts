/**
 * Open Food Facts API integration.
 *
 * When a barcode is detected, this module looks up the product's
 * nutritional data from the free Open Food Facts database.
 * All values are per 100g unless otherwise noted.
 */

export interface OFFProduct {
  name: string;
  nameHe: string;
  calories: number;  // per 100g
  protein: number;   // per 100g
  carbs: number;     // per 100g
  fat: number;       // per 100g
  servingSize: string;
  servingGrams: number;
  imageUrl: string | null;
  barcode: string;
}

export async function lookupBarcode(barcode: string): Promise<OFFProduct | null> {
  const url = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,product_name_he,nutriments,serving_size,serving_quantity,image_front_url`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CalEye/1.0' },
    });

    if (!res.ok) {
      console.warn(`[CalEye/OFF] API error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data.status !== 1) {
      console.warn(`[CalEye/OFF] Product not found for barcode: ${barcode}`);
      return null;
    }

    const p = data.product;
    const n = p.nutriments || {};

    return {
      name: p.product_name || 'Unknown product',
      nameHe: p.product_name_he || p.product_name || '\u05DE\u05D5\u05E6\u05E8 \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2',
      calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
      protein: Math.round((n.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((n.fat_100g || 0) * 10) / 10,
      servingSize: p.serving_size || '100g',
      servingGrams: p.serving_quantity || 100,
      imageUrl: p.image_front_url || null,
      barcode,
    };
  } catch (err) {
    console.error('[CalEye/OFF] Lookup failed:', err);
    return null;
  }
}
