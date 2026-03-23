import type { DetectionResult } from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'google/gemini-2.0-flash-001';

const API_BASE_URL = 'https://openrouter.ai/api/v1';

const DETECTION_PROMPT = `You are an expert nutritionist analyzing a webcam image for food detection.

ANALYSIS STEPS (follow this chain of thought):
1. DETECT: Is there food visible in the image? Look for food items, plates, bowls, packaging, or someone eating.
2. CLASSIFY: For each food — is it packaged (has visible branding/label) or loose (homemade/restaurant)?
3. DESCRIBE: Note physical dimensions using reference objects (plate ~24cm, fork ~18cm, fist ~150g).
4. ESTIMATE GRAMS: Convert to grams. References: 1 egg ~50g, fist of rice ~150g, palm chicken ~120g, slice of bread ~30g, apple ~180g.
5. CALCULATE: calories and macros based on the estimated grams.

CRITICAL RULES:
- Be CONSERVATIVE with confidence when image is unclear or food is partially hidden.
- For packaged food: set "packaged": true, "needs_user_input": true. Don't guess weight — ask user.
- Consider cooking method (fried adds ~50 cal from oil, grilled does not).
- Account for hidden ingredients: dressings, oils, sauces, butter, sugar in drinks.
- Hebrew food names for Israeli foods (שקשוקה, חומוס, פיתה, שווארמה, etc.)

Respond ONLY with valid JSON:

If food detected:
{
  "eating": true,
  "foods": [{
    "food": "English name",
    "foodHe": "שם בעברית",
    "estimated_grams": 150,
    "calories": 250,
    "protein": 12,
    "carbs": 30,
    "fat": 8,
    "packaged": false,
    "confidence": 0.85,
    "needs_user_input": false,
    "user_question_he": null
  }],
  "total_calories": 250,
  "total_protein": 12,
  "total_carbs": 30,
  "total_fat": 8
}

If needs_user_input is true, provide Hebrew question:
- "כמה גרם כתוב על האריזה?" (packaged)
- "כמה כפות לקחת?" (unclear portion)
- "זה לחם לבן או מקמח מלא?" (ambiguous type)

If no food: { "eating": false }

WEBCAM NOTE: Images may be grainy or poorly lit. Only analyze clearly visible food. Lower confidence for unclear images.`;

const MIN_CALL_INTERVAL_MS = 2000;

const STORAGE_KEY = 'caleye_gemini_api_key';

// ── Rate limiter ─────────────────────────────────────────────────────────────

let lastCallTimestamp = 0;

function canMakeCall(): boolean {
  return Date.now() - lastCallTimestamp >= MIN_CALL_INTERVAL_MS;
}

function markCallMade(): void {
  lastCallTimestamp = Date.now();
}

// ── API Key management ───────────────────────────────────────────────────────

export function getApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function removeApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── SDK approach (using @google/genai) ───────────────────────────────────────

async function analyzeWithSDK(
  base64Image: string,
  apiKey: string
): Promise<DetectionResult> {
  // Dynamic import — only loads if the package is available
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: DETECTION_PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  return parseDetectionResponse(text);
}

// ── Direct fetch approach ────────────────────────────────────────────────────

async function analyzeWithFetch(
  base64Image: string,
  apiKey: string
): Promise<DetectionResult> {
  const url = `${API_BASE_URL}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: DETECTION_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `Gemini API error ${response.status}: ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();
  console.log('[CalEye] OpenRouter response:', data);

  // Extract text from OpenAI-compatible response
  const text =
    data?.choices?.[0]?.message?.content ?? '';

  if (!text) {
    throw new Error('Empty response from OpenRouter API');
  }

  return parseDetectionResponse(text);
}

// ── Response parser ──────────────────────────────────────────────────────────

function parseDetectionResponse(raw: string): DetectionResult {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  if (!parsed || typeof parsed.eating !== 'boolean') {
    throw new Error('Invalid detection response structure');
  }

  if (!parsed.eating) {
    return { eating: false };
  }

  // New format: foods array with totals
  if (parsed.foods && Array.isArray(parsed.foods) && parsed.foods.length > 0) {
    const mainFood = parsed.foods[0];
    const allFoodNames = parsed.foods.map((f: { foodHe?: string }) => f.foodHe || '').join(' + ');
    return {
      eating: true,
      food: parsed.foods.map((f: { food?: string }) => f.food || '').join(' + '),
      foodHe: allFoodNames || 'מזון לא ידוע',
      calories: clampNumber(parsed.total_calories ?? mainFood?.calories, 0, 5000),
      protein: clampNumber(parsed.total_protein ?? mainFood?.protein, 0, 500),
      carbs: clampNumber(parsed.total_carbs ?? mainFood?.carbs, 0, 500),
      fat: clampNumber(parsed.total_fat ?? mainFood?.fat, 0, 500),
      confidence: clampNumber(mainFood?.confidence, 0, 1),
    };
  }

  // Fallback: old format
  return {
    eating: true,
    food: String(parsed.food ?? 'Unknown food'),
    foodHe: String(parsed.foodHe ?? 'מזון לא ידוע'),
    calories: clampNumber(parsed.calories, 0, 5000),
    protein: clampNumber(parsed.protein, 0, 500),
    carbs: clampNumber(parsed.carbs, 0, 500),
    fat: clampNumber(parsed.fat, 0, 500),
    confidence: clampNumber(parsed.confidence, 0, 1),
  };
}

function clampNumber(
  value: unknown,
  min: number,
  max: number
): number {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

// ── Main exported function ───────────────────────────────────────────────────

/**
 * Analyzes a webcam frame for food detection using Gemini Vision.
 *
 * Tries the @google/genai SDK first; falls back to direct REST fetch.
 * Enforces a minimum 2-second interval between calls.
 *
 * @param base64Image - JPEG image encoded as base64 (no data URI prefix)
 * @returns DetectionResult — `{ eating: false }` on any failure
 */
export async function analyzeFrame(
  base64Image: string
): Promise<DetectionResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[CalEye] No Gemini API key configured');
    return { eating: false };
  }

  if (!canMakeCall()) {
    console.debug('[CalEye] Rate limited — skipping frame');
    return { eating: false };
  }

  markCallMade();

  console.log('[CalEye] 🔍 Analyzing frame via OpenRouter...');

  try {
    const result = await analyzeWithFetch(base64Image, apiKey);
    console.log('[CalEye] ✅ Result:', JSON.stringify(result));
    return result;
  } catch (fetchError) {
    console.error('[CalEye] ❌ Failed:', fetchError);
    return { eating: false };
  }
}

// ── Connection tester ────────────────────────────────────────────────────────

/**
 * Tests whether the stored API key is valid by making a minimal request.
 * Returns `true` if the key works, `false` otherwise.
 */
export async function testConnection(
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  const key = apiKey ?? getApiKey();
  if (!key) {
    return { success: false, error: 'לא הוזן מפתח API' };
  }

  try {
    const url = `${API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with: {"status":"ok"}' }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (response.status === 400 || response.status === 403) {
        return { success: false, error: 'מפתח API לא תקין' };
      }
      return {
        success: false,
        error: `שגיאת API: ${response.status} ${body.slice(0, 100)}`,
      };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'שגיאה לא ידועה';
    return { success: false, error: message };
  }
}
