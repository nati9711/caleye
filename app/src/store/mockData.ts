import type { DailyLog, UserProfile, FoodEntry } from '../types';

const now = Date.now();
const today = new Date().toISOString().split('T')[0];

export const MOCK_ENTRIES: FoodEntry[] = [
  {
    id: '1',
    timestamp: new Date().setHours(7, 45, 0, 0),
    food: 'Shakshuka',
    foodHe: 'שקשוקה',
    calories: 380,
    protein: 18,
    carbs: 32,
    fat: 14,
    confidence: 0.95,
    thumbnail: '',
  },
  {
    id: '2',
    timestamp: new Date().setHours(9, 15, 0, 0),
    food: 'Eggs and Whole Wheat Bread',
    foodHe: 'ביצים + לחם מחיטה מלאה',
    calories: 320,
    protein: 22,
    carbs: 28,
    fat: 8,
    confidence: 0.92,
    thumbnail: '',
  },
  {
    id: '3',
    timestamp: new Date().setHours(12, 30, 0, 0),
    food: 'Margherita Pizza',
    foodHe: 'פיצה מרגריטה',
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    confidence: 0.87,
    thumbnail: '',
  },
  {
    id: '4',
    timestamp: new Date().setHours(16, 0, 0, 0),
    food: 'Greek Salad',
    foodHe: 'סלט יווני',
    calories: 162,
    protein: 6,
    carbs: 14,
    fat: 10,
    confidence: 0.91,
    thumbnail: '',
  },
];

export const MOCK_TODAY_LOG: DailyLog = {
  date: today!,
  entries: MOCK_ENTRIES,
  totalCalories: MOCK_ENTRIES.reduce((s, e) => s + e.calories, 0),
  totalProtein: MOCK_ENTRIES.reduce((s, e) => s + e.protein, 0),
  totalCarbs: MOCK_ENTRIES.reduce((s, e) => s + e.carbs, 0),
  totalFat: MOCK_ENTRIES.reduce((s, e) => s + e.fat, 0),
  xpEarned: 45,
};

export const MOCK_PROFILE: UserProfile = {
  name: 'נתנאל',
  gender: 'male',
  age: 28,
  weight: 75,
  height: 178,
  activityLevel: 'active',
  calorieGoal: 2000,
  macroSplit: { protein: 30, carbs: 40, fat: 30 },
  level: 4,
  totalXP: 920,
  currentStreak: 12,
  bestStreak: 23,
  lastActiveDate: today!,
  badges: ['first-meal', 'first-week', 'balanced'],
  streakFreezesUsed: 0,
  joinDate: '2026-03-01',
  workoutsConfirmed: 5,
  foodCorrections: 3,
  uniqueFoodsDetected: ['שקשוקה', 'פיצה', 'סלט', 'ביצים'],
};

/** Hourly calorie data for the chart (index 0 = hour 6, index 17 = hour 23) */
export const MOCK_HOURLY_CALORIES: { hour: number; calories: number; foods: string[] }[] = [
  { hour: 6, calories: 0, foods: [] },
  { hour: 7, calories: 380, foods: ['שקשוקה'] },
  { hour: 8, calories: 0, foods: [] },
  { hour: 9, calories: 320, foods: ['ביצים + לחם'] },
  { hour: 10, calories: 0, foods: [] },
  { hour: 11, calories: 0, foods: [] },
  { hour: 12, calories: 285, foods: ['פיצה מרגריטה'] },
  { hour: 13, calories: 0, foods: [] },
  { hour: 14, calories: 0, foods: [] },
  { hour: 15, calories: 0, foods: [] },
  { hour: 16, calories: 162, foods: ['סלט יווני'] },
  { hour: 17, calories: 0, foods: [] },
  { hour: 18, calories: 0, foods: [] },
  { hour: 19, calories: 0, foods: [] },
  { hour: 20, calories: 0, foods: [] },
  { hour: 21, calories: 0, foods: [] },
  { hour: 22, calories: 0, foods: [] },
  { hour: 23, calories: 0, foods: [] },
];

/** Level definitions for display */
export const LEVELS = [
  { level: 1, name: 'טירון', xpRequired: 0, totalXP: 0 },
  { level: 2, name: 'טועם', xpRequired: 100, totalXP: 100 },
  { level: 3, name: 'טעמן', xpRequired: 250, totalXP: 350 },
  { level: 4, name: 'שף טירון', xpRequired: 400, totalXP: 750 },
  { level: 5, name: 'בריאן', xpRequired: 600, totalXP: 1350 },
  { level: 6, name: 'מאזן מאסטר', xpRequired: 800, totalXP: 2150 },
  { level: 7, name: 'אלוף התזונה', xpRequired: 1000, totalXP: 3150 },
  { level: 8, name: 'לוחם כושר', xpRequired: 1500, totalXP: 4650 },
  { level: 9, name: 'גורו הבריאות', xpRequired: 2000, totalXP: 6650 },
  { level: 10, name: 'אגדת קאלאיי', xpRequired: 3000, totalXP: 9650 },
];
