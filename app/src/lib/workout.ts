import type { UserProfile, DailyLog, WorkoutSuggestion } from '../types';

// ──────────────────────────────────────────────────
// Workout Suggestion Engine (spec section 5)
// ──────────────────────────────────────────────────

type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

// ──────────────────────────────────────────────────
// Calorie-Based Workout Pools (section 5.1)
// ──────────────────────────────────────────────────

interface WorkoutOption {
  type: string;
  typeHe: string;
  emoji: string;
  durationMin: number;
  durationMax: number;
  burnPerMin: number; // approximate kcal/min
}

const LIGHT_WORKOUTS: WorkoutOption[] = [
  { type: 'walking',    typeHe: 'הליכה קלה', emoji: '🚶', durationMin: 15, durationMax: 15, burnPerMin: 4 },
  { type: 'stretching', typeHe: 'מתיחות',    emoji: '🧘', durationMin: 15, durationMax: 15, burnPerMin: 3 },
];

const MEDIUM_WORKOUTS: WorkoutOption[] = [
  { type: 'brisk_walk', typeHe: 'הליכה מהירה', emoji: '🏃', durationMin: 20, durationMax: 30, burnPerMin: 6 },
  { type: 'yoga',       typeHe: 'יוגה',        emoji: '🧘', durationMin: 20, durationMax: 30, burnPerMin: 4 },
  { type: 'cycling',    typeHe: 'רכיבה',       emoji: '🚴', durationMin: 20, durationMax: 30, burnPerMin: 7 },
];

const HEAVY_WORKOUTS: WorkoutOption[] = [
  { type: 'running',    typeHe: 'ריצה',        emoji: '🏃', durationMin: 25, durationMax: 30, burnPerMin: 10 },
  { type: 'strength',   typeHe: 'אימון כוח',   emoji: '💪', durationMin: 25, durationMax: 30, burnPerMin: 8 },
  { type: 'swimming',   typeHe: 'שחייה',       emoji: '🏊', durationMin: 25, durationMax: 30, burnPerMin: 9 },
];

const VERY_HEAVY_WORKOUTS: WorkoutOption[] = [
  { type: 'long_run',    typeHe: 'ריצה ארוכה',    emoji: '🏃', durationMin: 30, durationMax: 45, burnPerMin: 10 },
  { type: 'hiit',        typeHe: 'HIIT',           emoji: '⚡', durationMin: 30, durationMax: 45, burnPerMin: 12 },
  { type: 'combined',    typeHe: 'אימון משולב',    emoji: '🏋️', durationMin: 30, durationMax: 45, burnPerMin: 9 },
];

// ──────────────────────────────────────────────────
// Wait Time Table (section 5.1)
// ──────────────────────────────────────────────────

/**
 * Get recommended wait time in minutes after eating, based on calorie count.
 */
export function getWaitTime(calories: number): number {
  if (calories <= 300) return 30;
  if (calories <= 600) return 45;
  if (calories <= 1000) return 60;
  return 90;
}

// ──────────────────────────────────────────────────
// Time-of-Day Helpers (section 5.3)
// ──────────────────────────────────────────────────

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'evening';
  return 'night';
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 5 || day === 6; // Friday / Saturday
}

// ──────────────────────────────────────────────────
// Macro Analysis (section 5.2)
// ──────────────────────────────────────────────────

type DominantMacro = 'carbs' | 'protein' | 'fat' | 'balanced';

function getDominantMacro(protein: number, carbs: number, fat: number): DominantMacro {
  const total = protein + carbs + fat;
  if (total === 0) return 'balanced';

  const carbPct = (carbs / total) * 100;
  const proteinPct = (protein / total) * 100;
  const fatPct = (fat / total) * 100;

  if (carbPct > 50) return 'carbs';
  if (proteinPct > 35) return 'protein';
  if (fatPct > 40) return 'fat';
  return 'balanced';
}

// ──────────────────────────────────────────────────
// Workout Filtering by Time & Macro
// ──────────────────────────────────────────────────

function filterByTimeOfDay(workouts: WorkoutOption[], tod: TimeOfDay): WorkoutOption[] {
  switch (tod) {
    case 'morning':
    case 'afternoon':
      // Full range
      return workouts;

    case 'midday':
      // Prefer shorter sessions (office-friendly)
      return workouts.filter(w =>
        ['walking', 'stretching', 'brisk_walk', 'yoga'].includes(w.type)
      ).length > 0
        ? workouts.filter(w =>
            ['walking', 'stretching', 'brisk_walk', 'yoga'].includes(w.type)
          )
        : workouts;

    case 'evening':
      // No HIIT — moderate only
      return workouts.filter(w => w.type !== 'hiit' && w.type !== 'long_run');

    case 'night':
      // Only stretching/yoga or defer to tomorrow
      return [
        { type: 'stretching', typeHe: 'מתיחות', emoji: '🧘', durationMin: 15, durationMax: 15, burnPerMin: 3 },
      ];
  }
}

function filterByMacro(workouts: WorkoutOption[], macro: DominantMacro): WorkoutOption[] {
  if (workouts.length <= 1) return workouts;

  switch (macro) {
    case 'carbs':
      // Prefer cardio
      return preferTypes(workouts, ['running', 'cycling', 'brisk_walk', 'swimming', 'long_run', 'hiit']);
    case 'protein':
      // Prefer strength
      return preferTypes(workouts, ['strength', 'combined']);
    case 'fat':
      // Prefer low-intensity
      return preferTypes(workouts, ['walking', 'yoga', 'stretching', 'brisk_walk']);
    case 'balanced':
      return workouts;
  }
}

function preferTypes(workouts: WorkoutOption[], preferred: string[]): WorkoutOption[] {
  const filtered = workouts.filter(w => preferred.includes(w.type));
  return filtered.length > 0 ? filtered : workouts;
}

// ──────────────────────────────────────────────────
// Build Suggestion (section 5.5)
// ──────────────────────────────────────────────────

function buildSuggestion(workout: WorkoutOption, calories: number, waitMinutes: number, reason: string): WorkoutSuggestion {
  const duration = workout.durationMin === workout.durationMax
    ? `${workout.durationMin} דק'`
    : `${workout.durationMin}-${workout.durationMax} דק'`;

  const avgDuration = (workout.durationMin + workout.durationMax) / 2;
  const caloriesBurn = Math.round(workout.burnPerMin * avgDuration);

  return {
    type: workout.type,
    typeHe: workout.typeHe,
    duration,
    caloriesBurn,
    waitMinutes,
    emoji: workout.emoji,
    reason,
  };
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

/**
 * Suggest a workout based on last meal calories, dominant macro, and time of day.
 */
export function suggestWorkout(
  lastMealCalories: number,
  dominantMacro: DominantMacro,
  timeOfDay: TimeOfDay
): WorkoutSuggestion {
  // 1. Pick workout pool by calorie range
  let pool: WorkoutOption[];
  let reason: string;

  if (lastMealCalories <= 300) {
    pool = LIGHT_WORKOUTS;
    reason = 'ארוחה קלה — תנועה קלה תשלים את היום';
  } else if (lastMealCalories <= 600) {
    pool = MEDIUM_WORKOUTS;
    reason = 'ארוחה בינונית — בוא ננצל את האנרגיה';
  } else if (lastMealCalories <= 1000) {
    pool = HEAVY_WORKOUTS;
    reason = `ארוחה של ${lastMealCalories} קק"ל — בוא נשרוף קצת`;
  } else {
    pool = VERY_HEAVY_WORKOUTS;
    reason = `ארוחה כבדה (${lastMealCalories} קק"ל) — אימון רציני מתאים`;
  }

  // 2. Filter by time of day
  pool = filterByTimeOfDay(pool, timeOfDay);

  // 3. Filter by dominant macro
  pool = filterByMacro(pool, dominantMacro);

  // 4. Night special case: suggest "tomorrow morning"
  if (timeOfDay === 'night' && pool.length === 1 && pool[0]?.type === 'stretching') {
    const wait = getWaitTime(lastMealCalories);
    const suggestion = buildSuggestion(pool[0]!, lastMealCalories, wait, 'מאוחר — מתיחות קלות או אימון מחר בבוקר');
    return suggestion;
  }

  // 5. Weekend: prefer leisure activities
  if (isWeekend()) {
    const leisure = pool.filter(w =>
      ['walking', 'brisk_walk', 'swimming', 'yoga', 'cycling'].includes(w.type)
    );
    if (leisure.length > 0) pool = leisure;
  }

  // 6. Pick random from pool
  const chosen = pool[Math.floor(Math.random() * pool.length)]!;
  const waitMinutes = getWaitTime(lastMealCalories);

  return buildSuggestion(chosen, lastMealCalories, waitMinutes, reason);
}

/**
 * Determine if we should suggest a workout right now.
 * Smart rules from spec section 5.4.
 */
export function shouldSuggestWorkout(
  profile: UserProfile,
  todayLog: DailyLog,
  lastMealTime: number
): boolean {
  const now = Date.now();
  const currentHour = new Date(now).getHours();

  // Rule 3: Don't suggest during sleep hours (22:00–07:00)
  if (currentHour >= 22 || currentHour < 7) return false;

  // Rule 2: Max 2 suggestions per day (approximate via workoutsConfirmed for today)
  // We track via daily workout suggestion count in the calling code.
  // Here we just check general fitness.

  // Rule 1: Never suggest immediately after eating — check wait time
  const lastEntry = todayLog.entries[todayLog.entries.length - 1];
  const lastMealCal = lastEntry ? lastEntry.calories : 0;
  const waitMs = getWaitTime(lastMealCal) * 60 * 1000;
  const timeSinceLastMeal = now - lastMealTime;

  if (timeSinceLastMeal < waitMs) return false;

  // Rule 4: If user already confirmed a workout today, only suggest if they ate 800+ since
  if (profile.workoutsConfirmed > 0) {
    const calSinceWorkout = todayLog.entries
      .filter(e => e.timestamp > lastMealTime)
      .reduce((sum, e) => sum + e.calories, 0);
    if (calSinceWorkout < 800) return false;
  }

  return true;
}

/**
 * Full-flow: suggest a workout from a food entry, considering all rules.
 * Returns null if suggestion should not be shown.
 */
export function suggestWorkoutForEntry(
  entry: { calories: number; protein: number; carbs: number; fat: number; timestamp: number },
  profile: UserProfile,
  todayLog: DailyLog
): WorkoutSuggestion | null {
  // Check if suggestion is appropriate
  if (!shouldSuggestWorkout(profile, todayLog, entry.timestamp)) {
    return null;
  }

  const macro = getDominantMacro(entry.protein, entry.carbs, entry.fat);
  const hour = new Date(entry.timestamp).getHours();
  const tod = getTimeOfDay(hour);

  return suggestWorkout(entry.calories, macro, tod);
}

/**
 * Export getDominantMacro for external use.
 */
export { getDominantMacro, getTimeOfDay };
export type { DominantMacro, TimeOfDay };
