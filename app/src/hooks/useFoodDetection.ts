import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeFrame } from '../lib/gemini';
import { lookupNutrition } from '../lib/nutrition';
import { detectBarcode } from '../lib/barcode';
import { lookupBarcode } from '../lib/openFoodFacts';
import type { DetectionResult, FoodEntry } from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

const DETECTION_INTERVAL_MS = 10_000; // 10 seconds between captures
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RECENT_DETECTIONS = 3;
const MIN_CONFIDENCE = 0.7;
const XP_PER_DETECTION = 5;

// ── Types ────────────────────────────────────────────────────────────────────

interface RecentDetection {
  food: string;
  timestamp: number;
}

export interface UseFoodDetectionReturn {
  /** Whether the detection loop is currently active */
  isDetecting: boolean;
  /** Whether a request is in-flight right now */
  isPending: boolean;
  /** The most recent detection result */
  lastResult: DetectionResult | null;
  /** Toggle detection on/off */
  toggleDetection: () => void;
  /** Start detection */
  startDetection: () => void;
  /** Stop detection */
  stopDetection: () => void;
  /** Current error message (Hebrew) */
  error: string | null;
}

export interface FoodDetectionCallbacks {
  /** Called to capture a frame from the webcam. Returns base64 JPEG or null. */
  captureFrame: () => string | null;
  /** Called when a new food entry is detected (after dedup). */
  onFoodDetected: (entry: FoodEntry) => void;
  /** Called to show a toast notification. */
  onToast: (entry: FoodEntry) => void;
  /** Called to award XP. */
  onXpAwarded: (xp: number) => void;
  /** Whether the webcam is ready. */
  isWebcamReady: boolean;
  /** Called when AI has low confidence or needs user input — entry needs confirmation */
  onNeedsConfirmation?: (entry: FoodEntry, userQuestion?: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeFood(name: string): string {
  return name.toLowerCase().trim();
}

function isDuplicate(
  food: string,
  recentDetections: RecentDetection[]
): boolean {
  const normalized = normalizeFood(food);
  const now = Date.now();

  return recentDetections.some(
    (d) =>
      normalizeFood(d.food) === normalized &&
      now - d.timestamp < DEDUP_WINDOW_MS
  );
}

function createFoodEntry(
  result: DetectionResult,
  thumbnail: string
): FoodEntry {
  return {
    id: generateId(),
    timestamp: Date.now(),
    food: result.food ?? 'Unknown',
    foodHe: result.foodHe ?? 'לא ידוע',
    calories: result.calories ?? 0,
    protein: result.protein ?? 0,
    carbs: result.carbs ?? 0,
    fat: result.fat ?? 0,
    confidence: result.confidence ?? 0,
    thumbnail,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useFoodDetection(
  callbacks: FoodDetectionCallbacks
): UseFoodDetectionReturn {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutable refs for values used inside the interval callback
  const recentDetectionsRef = useRef<RecentDetection[]>([]);
  const isPendingRef = useRef(false);
  const callbacksRef = useRef(callbacks);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep callbacks ref fresh
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // ── Core detection tick ──────────────────────────────────────────────────

  const runDetectionTick = useCallback(async () => {
    const cbs = callbacksRef.current;

    // Skip if previous request still pending
    if (isPendingRef.current) {
      console.debug('[CalEye] Skipping tick — previous request pending');
      return;
    }

    // Skip if webcam not ready
    if (!cbs.isWebcamReady) {
      console.debug('[CalEye] Skipping tick — webcam not ready');
      return;
    }

    // Capture frame
    const frame = cbs.captureFrame();
    if (!frame) {
      console.debug('[CalEye] Skipping tick — no frame captured');
      return;
    }

    isPendingRef.current = true;
    setIsPending(true);
    setError(null);

    try {
      // ── Step 1: Try barcode detection (free, instant, local) ────────────
      const barcode = await detectBarcode(frame);
      if (barcode) {
        if (!isDuplicate(barcode, recentDetectionsRef.current)) {
          console.log(`[CalEye] Barcode detected: ${barcode}`);
          const product = await lookupBarcode(barcode);
          if (product) {
            console.log(`[CalEye] Product found via barcode: ${product.name}`);
            const servingScale = product.servingGrams / 100;
            const entry: FoodEntry = {
              id: generateId(),
              timestamp: Date.now(),
              food: product.name,
              foodHe: product.nameHe,
              calories: Math.round(product.calories * servingScale),
              protein: Math.round(product.protein * servingScale * 10) / 10,
              carbs: Math.round(product.carbs * servingScale * 10) / 10,
              fat: Math.round(product.fat * servingScale * 10) / 10,
              confidence: 0.99, // barcode = exact match
              thumbnail: `data:image/jpeg;base64,${frame}`,
            };

            recentDetectionsRef.current = [
              { food: barcode, timestamp: Date.now() },
              ...recentDetectionsRef.current,
            ].slice(0, MAX_RECENT_DETECTIONS);

            console.log(`[CalEye] Source: Open Food Facts (barcode)`);
            cbs.onFoodDetected(entry);
            cbs.onToast(entry);
            cbs.onXpAwarded(XP_PER_DETECTION);
            return; // Skip Gemini — barcode data is exact
          }
          console.log(`[CalEye] Barcode ${barcode} not found in Open Food Facts, falling back to Gemini`);
        }
      }

      // ── Step 2: No barcode → existing Gemini + USDA flow ────────────────
      const result = await analyzeFrame(frame);
      setLastResult(result);

      if (!result.eating) {
        return; // Not eating — nothing to do
      }

      // Check dedup
      const foodName = result.food ?? '';
      if (isDuplicate(foodName, recentDetectionsRef.current)) {
        console.debug(`[CalEye] Duplicate detection skipped: ${foodName}`);
        return;
      }

      // Record this detection for dedup
      recentDetectionsRef.current = [
        { food: foodName, timestamp: Date.now() },
        ...recentDetectionsRef.current,
      ].slice(0, MAX_RECENT_DETECTIONS);

      // Use AI's gram estimate, default to 100g if missing
      const estimatedGrams = result.estimatedGrams ?? 100;
      console.log(`[CalEye] AI estimated: ${result.food} = ${estimatedGrams}g`);

      // Look up REAL nutrition data from USDA
      const usdaData = await lookupNutrition(result.food ?? '', estimatedGrams);

      // Create the food entry — prefer USDA data over AI estimate
      const thumbnailDataUri = `data:image/jpeg;base64,${frame}`;
      const entry = usdaData
        ? {
            ...createFoodEntry(result, thumbnailDataUri),
            calories: usdaData.calories,
            protein: usdaData.protein,
            carbs: usdaData.carbs,
            fat: usdaData.fat,
          }
        : createFoodEntry(result, thumbnailDataUri);

      console.log(`[CalEye] 📊 Source: ${usdaData ? 'USDA ✅' : 'AI estimate ⚠️'}`);

      // Low confidence or needs_user_input → route to confirmation dialog
      const isLowConfidence = (result.confidence ?? 0) < MIN_CONFIDENCE;
      const needsInput = result.needsUserInput === true;

      if ((isLowConfidence || needsInput) && cbs.onNeedsConfirmation) {
        console.debug(`[CalEye] Needs confirmation — confidence: ${result.confidence}, needsInput: ${needsInput}`);
        cbs.onNeedsConfirmation(entry, result.userQuestionHe);
        return;
      }

      // High confidence — auto-log
      cbs.onFoodDetected(entry);
      cbs.onToast(entry);
      cbs.onXpAwarded(XP_PER_DETECTION);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בזיהוי מזון';
      console.error('[CalEye] Detection error:', err);

      // Differentiate error types for the UI
      if (message === 'NO_API_KEY') {
        setError('NO_API_KEY');
      } else if (message.includes('401') || message.includes('403')) {
        setError('INVALID_API_KEY');
      } else if (message.includes('429')) {
        setError('RATE_LIMITED');
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setError('NETWORK_ERROR');
      } else {
        setError(message);
      }
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }, []);

  // ── Interval management ────────────────────────────────────────────────

  useEffect(() => {
    if (isDetecting) {
      // Run immediately on start
      runDetectionTick();

      // Then run every DETECTION_INTERVAL_MS
      intervalRef.current = setInterval(
        runDetectionTick,
        DETECTION_INTERVAL_MS
      );
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isDetecting, runDetectionTick]);

  // ── Controls ───────────────────────────────────────────────────────────

  const startDetection = useCallback(() => {
    setIsDetecting(true);
    setError(null);
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
  }, []);

  const toggleDetection = useCallback(() => {
    setIsDetecting((prev) => !prev);
    setError(null);
  }, []);

  return {
    isDetecting,
    isPending,
    lastResult,
    toggleDetection,
    startDetection,
    stopDetection,
    error,
  };
}
