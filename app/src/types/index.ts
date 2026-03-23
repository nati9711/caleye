// ============================================================
// CalEye — Core Type Definitions
// All types are centrally defined here and exported.
// Other modules import from @/types
// ============================================================

/** A single detected food entry */
export interface FoodEntry {
  id: string;
  timestamp: number;
  food: string;
  foodHe: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  thumbnail: string; // base64 JPEG
}

/** Aggregated daily log */
export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  xpEarned: number;
}

/** User profile and persistent stats */
export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  calorieGoal: number;
  macroSplit: MacroSplit;
  level: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  badges: string[]; // badge IDs
  streakFreezesUsed: number;
  joinDate: string; // YYYY-MM-DD
  workoutsConfirmed: number;
  foodCorrections: number;
  uniqueFoodsDetected: string[];
}

export type ActivityLevel = 'sedentary' | 'light' | 'active' | 'athletic';

/** Macro nutrient percentage split */
export interface MacroSplit {
  protein: number; // percentage (0-100)
  carbs: number;   // percentage (0-100)
  fat: number;     // percentage (0-100)
}

/** Coach message bubble */
export interface CoachMessage {
  id: string;
  text: string;
  timestamp: number;
  category: CoachCategory;
}

/** All coach message categories */
export type CoachCategory =
  | 'healthy_meal'
  | 'unhealthy_meal'
  | 'no_eating'
  | 'close_to_goal'
  | 'exceeded_goal'
  | 'streak_milestone'
  | 'level_up'
  | 'morning'
  | 'evening'
  | 'workout_suggest'
  | 'balanced_macros'
  | 'late_night'
  | 'skipped_breakfast';

/** A workout suggestion card */
export interface WorkoutSuggestion {
  type: string;
  typeHe: string;
  duration: string;
  caloriesBurn: number;
  waitMinutes: number;
  emoji: string;
  reason: string;
}

/** Badge / achievement definition */
export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlockCondition: string;
  rarity: BadgeRarity;
  checkUnlock: (profile: UserProfile, log: DailyLog) => boolean;
}

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** Level definition */
export interface Level {
  level: number;
  name: string;
  xpRequired: number; // XP needed to advance FROM this level
  totalXP: number;    // cumulative XP at start of this level
}

/** Nudge / notification configuration */
export interface NudgeConfig {
  type: NudgeType;
  priority: NudgePriority;
  duration: number; // ms
  content: string;
}

export type NudgeType = 'toast' | 'coach_bubble' | 'bottom_sheet' | 'fullscreen' | 'status';
export type NudgePriority = 'highest' | 'high' | 'medium' | 'low' | 'info';

/** Result from the AI detection pipeline */
export interface DetectionResult {
  eating: boolean;
  food?: string;
  foodHe?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: number;
}

/** Macro preset option for onboarding */
export interface MacroPreset {
  id: string;
  name: string;
  split: MacroSplit;
}

/** Streak milestone reward */
export interface StreakMilestone {
  days: number;
  xpReward: number;
  badgeId: string | null;
  visual: string;
}

/** Workout calorie range mapping */
export interface WorkoutMapping {
  label: string;
  minCal: number;
  maxCal: number;
  workouts: WorkoutSuggestion[];
}

/** XP reward definition */
export interface XPReward {
  action: string;
  xp: number;
  maxPerDay: number | null;
  description: string;
}

/** Color palette entry */
export interface ColorEntry {
  name: string;
  hex: string;
  usage: string;
}

// ============================================================
// App State — Zustand store shape
// ============================================================

export interface AppState {
  // User
  profile: UserProfile | null;
  isOnboarded: boolean;

  // Detection
  isDetecting: boolean;
  lastDetection: FoodEntry | null;
  isPending: boolean;

  // Daily data
  todayLog: DailyLog;

  // Coach
  coachMessages: CoachMessage[];

  // UI
  activeToast: NudgeConfig | null;
  showLevelUp: boolean;
  showBadgeUnlock: Badge | null;

  // Actions
  addFoodEntry: (entry: FoodEntry) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addXP: (amount: number, reason: string) => void;
  addCoachMessage: (msg: Omit<CoachMessage, 'id' | 'timestamp'>) => void;
  confirmWorkout: () => void;
  setDetecting: (v: boolean) => void;
  setToast: (toast: NudgeConfig | null) => void;
  resetDay: () => void;
  unlockBadge: (badgeId: string) => void;
}
