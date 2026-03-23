// ============================================================
// CalEye — All Constants
// Every Hebrew string, config value, and lookup table lives here.
// Components import from @/constants — NEVER hardcode strings.
// ============================================================

import type {
  Level,
  Badge,
  UserProfile,
  DailyLog,
  WorkoutSuggestion,
  MacroPreset,
  StreakMilestone,
  XPReward,
  WorkoutMapping,
  CoachCategory,
} from '@/types';

// ============================================================
// LEVELS — 15 levels with Hebrew names and XP thresholds
// ============================================================

export const LEVELS: Level[] = [
  { level: 1,  name: 'טירון',          xpRequired: 100,   totalXP: 0 },
  { level: 2,  name: 'טועם',           xpRequired: 250,   totalXP: 100 },
  { level: 3,  name: 'טעמן',           xpRequired: 400,   totalXP: 350 },
  { level: 4,  name: 'שף טירון',       xpRequired: 600,   totalXP: 750 },
  { level: 5,  name: 'בריאן',          xpRequired: 800,   totalXP: 1350 },
  { level: 6,  name: 'מאזן מאסטר',     xpRequired: 1000,  totalXP: 2150 },
  { level: 7,  name: 'אלוף התזונה',    xpRequired: 1500,  totalXP: 3150 },
  { level: 8,  name: 'לוחם כושר',      xpRequired: 2000,  totalXP: 4650 },
  { level: 9,  name: 'גורו הבריאות',   xpRequired: 3000,  totalXP: 6650 },
  { level: 10, name: 'אגדת קאלאיי',    xpRequired: 4000,  totalXP: 9650 },
  { level: 11, name: 'מאסטר שף',       xpRequired: 5000,  totalXP: 13650 },
  { level: 12, name: 'נינג\'ה תזונתי', xpRequired: 7000,  totalXP: 18650 },
  { level: 13, name: 'טיטאן הבריאות',  xpRequired: 10000, totalXP: 25650 },
  { level: 14, name: 'אליל העל',       xpRequired: 15000, totalXP: 35650 },
  { level: 15, name: '∞ מעבר לגבול',   xpRequired: Infinity, totalXP: 50650 },
];

// ============================================================
// BADGES — 15 badges with unlock logic
// ============================================================

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    emoji: '👶',
    name: 'צעד ראשון',
    description: 'הארוחה הראשונה שזוהתה',
    unlockCondition: 'First food detection',
    rarity: 'common',
    checkUnlock: (_profile: UserProfile, log: DailyLog) =>
      log.entries.length >= 1,
  },
  {
    id: 'first_week',
    emoji: '📅',
    name: 'שבוע ראשון',
    description: 'שרדת שבוע שלם!',
    unlockCondition: '7-day streak',
    rarity: 'common',
    checkUnlock: (profile: UserProfile) =>
      profile.currentStreak >= 7,
  },
  {
    id: 'balanced',
    emoji: '⚖️',
    name: 'מאוזן',
    description: 'מאקרו מושלם ביום שלם',
    unlockCondition: 'All macros within 5% of target',
    rarity: 'uncommon',
    checkUnlock: (profile: UserProfile, log: DailyLog) => {
      if (log.totalCalories === 0) return false;
      const totalMacroGrams = log.totalProtein + log.totalCarbs + log.totalFat;
      if (totalMacroGrams === 0) return false;
      const actualProteinPct = (log.totalProtein / totalMacroGrams) * 100;
      const actualCarbsPct = (log.totalCarbs / totalMacroGrams) * 100;
      const actualFatPct = (log.totalFat / totalMacroGrams) * 100;
      return (
        Math.abs(actualProteinPct - profile.macroSplit.protein) <= 5 &&
        Math.abs(actualCarbsPct - profile.macroSplit.carbs) <= 5 &&
        Math.abs(actualFatPct - profile.macroSplit.fat) <= 5
      );
    },
  },
  {
    id: 'early_bird',
    emoji: '🐦',
    name: 'ציפור מוקדמת',
    description: 'ארוחת בוקר לפני 8:00',
    unlockCondition: 'Eat before 8:00 AM, 5 times',
    rarity: 'uncommon',
    // Requires tracking early meals across days — checked via profile metadata
    checkUnlock: () => false, // Implemented in store with counter tracking
  },
  {
    id: 'on_fire',
    emoji: '🔥',
    name: 'על אש',
    description: 'סטריק של 14 יום',
    unlockCondition: '14-day streak',
    rarity: 'rare',
    checkUnlock: (profile: UserProfile) =>
      profile.currentStreak >= 14,
  },
  {
    id: 'calorie_sniper',
    emoji: '🎯',
    name: 'צלף קלורי',
    description: 'פגעת ביעד ±50 קק"ל',
    unlockCondition: 'Hit calorie goal within ±50 kcal',
    rarity: 'uncommon',
    checkUnlock: (profile: UserProfile, log: DailyLog) =>
      Math.abs(log.totalCalories - profile.calorieGoal) <= 50 && log.totalCalories > 0,
  },
  {
    id: 'sporty',
    emoji: '💪',
    name: 'ספורטיבי',
    description: 'השלמת 10 אימונים',
    unlockCondition: 'Confirm 10 workouts',
    rarity: 'rare',
    checkUnlock: (profile: UserProfile) =>
      profile.workoutsConfirmed >= 10,
  },
  {
    id: 'healthy_owl',
    emoji: '🌙',
    name: 'ינשוף בריא',
    description: 'לא אכלת אחרי 21:00, 7 ימים',
    unlockCondition: 'No food after 21:00 for 7 days',
    rarity: 'rare',
    checkUnlock: () => false, // Requires multi-day tracking
  },
  {
    id: 'green_green',
    emoji: '🥗',
    name: 'ירוק ירוק',
    description: '5 ארוחות בריאות ברצף',
    unlockCondition: '5 consecutive healthy meals (AI tagged)',
    rarity: 'uncommon',
    checkUnlock: () => false, // Requires AI tagging tracking
  },
  {
    id: 'machine_teacher',
    emoji: '🧠',
    name: 'מלמד מכונה',
    description: 'תיקנת את ה-AI 20 פעם',
    unlockCondition: 'Correct AI detection 20 times',
    rarity: 'rare',
    checkUnlock: (profile: UserProfile) =>
      profile.foodCorrections >= 20,
  },
  {
    id: 'full_month',
    emoji: '🏆',
    name: 'חודש מלא',
    description: 'סטריק של 30 יום!',
    unlockCondition: '30-day streak',
    rarity: 'epic',
    checkUnlock: (profile: UserProfile) =>
      profile.currentStreak >= 30,
  },
  {
    id: 'diverse',
    emoji: '🌈',
    name: 'מגוון',
    description: 'אכלת 20 מאכלים שונים',
    unlockCondition: '20 unique foods detected',
    rarity: 'uncommon',
    checkUnlock: (profile: UserProfile) =>
      profile.uniqueFoodsDetected.length >= 20,
  },
  {
    id: 'fast_powerful',
    emoji: '⚡',
    name: 'מהיר ועוצמתי',
    description: '3 אימונים בשבוע, 4 שבועות',
    unlockCondition: '3+ workouts/week for 4 weeks',
    rarity: 'epic',
    checkUnlock: () => false, // Requires multi-week tracking
  },
  {
    id: 'caleye_king',
    emoji: '👑',
    name: 'מלך הקאלאיי',
    description: 'הגעת לרמה 10',
    unlockCondition: 'Reach level 10',
    rarity: 'epic',
    checkUnlock: (profile: UserProfile) =>
      profile.level >= 10,
  },
  {
    id: 'diamond',
    emoji: '💎',
    name: 'יהלום',
    description: '100 יום סטריק',
    unlockCondition: '100-day streak',
    rarity: 'legendary',
    checkUnlock: (profile: UserProfile) =>
      profile.currentStreak >= 100,
  },
];

// ============================================================
// COACH MESSAGES — All 42 messages organized by category
// ============================================================

export const COACH_MESSAGES: Record<CoachCategory, string[]> = {
  healthy_meal: [
    'אוו, {name}! שקשוקה? יופי של בחירה. חלבון על הבוקר = מלך 👑',
    'סלט עם חזה עוף? את/ה ברצח היום. +5 XP 💚',
    'ירקות מאודים? מישהו לקח את הבריאות ברצינות! כל הכבוד 🥦',
    'אוכל ביתי! אין כמו. הגוף שלך אומר תודה 🏠',
    'פרוטאין בכל ארוחה — את/ה יודע/ת מה את/ה עושה 💪',
  ],
  unhealthy_meal: [
    'פיצה? מבין אותך, גם אני לא יכול לעמוד בפני. תהנה, נפצה על זה אחר כך 🍕',
    'המבורגר — קלאסיקה. לא אשפוט, רק אזכיר שהליכה של 30 דק\' תעשה פלאים 😉',
    'נראה שהיום יום חופשי מדיאטה, וזה לגמרי בסדר! מחר חוזרים לעניינים 💪',
    'שוקולד! לפעמים הנשמה צריכה. אם זה מריגע אותך, שווה את זה 🍫',
    'אהה, ארוחה עשירה! בואו נשמור על האנרגיה — אולי הליכה קטנה בהמשך?',
  ],
  no_eating: [
    'היי {name}, כבר 4 שעות בלי אוכל. הכל בסדר? הגוף צריך דלק ⛽',
    'אוקיי, השעה עוברת ולא ראיתי שום אוכל... לא לשכוח לאכול! 🕐',
    'פרו טיפ: לא לאכול מוריד את חילוף החומרים. תאכל/י משהו קטן לפחות 🥜',
  ],
  close_to_goal: [
    'נשאר לך עוד 200 קק"ל ליעד! ארוחת ערב קלה ואת/ה שם 🎯',
    'כמעט! 150 קק"ל ואתה פוגע ביעד. יוגורט + פירות? מושלם 🎯',
    'את/ה ממש קרוב ליעד היום. בואו נסגור את היום בסטייל!',
  ],
  exceeded_goal: [
    'עברת קצת מהיעד — אבל יום אחד לא הורס כלום. מחר יום חדש! 🌅',
    '100 קלוריות מעל? בכלל לא דרמה. הליכה של 20 דק\' מפצה על זה 🚶',
    'קצת מעל, אבל בסה"כ יום סביר. אל תהיה קשה עם עצמך 💚',
  ],
  streak_milestone: [
    '🔥 3 ימים ברצף! זה כבר הרגל! +50 XP',
    'שבוע שלם! 7 ימים ברצף — אתה חיה! 🔥🔥 +100 XP',
    '14 ימים?! את/ה לא עוצר/ת! \'על אש\' badge unlocked! 🏆',
    'חודש! 30 ימים! אני מתרגש יותר ממך כנראה 😂🔥🔥🔥🔥',
  ],
  level_up: [
    '🎉 LEVEL UP! ברוכים הבאים לרמה {level} — \'{levelName}\'! הדרך ארוכה אבל אתה רוכב!',
    'רמה {level}! \'{levelName}\' — השם הזה מתאים לך. באמת 💪',
    'אגדת קאלאיי! רמה {level}! אני... אני צריך רגע. מרגש. 🥲👑',
  ],
  morning: [
    'בוקר טוב {name}! 🌞 יום חדש, הזדמנות חדשה. מה נאכל היום?',
    'בוקר! המצלמה ערה ומוכנה. מתחילים עם ארוחת בוקר?',
    'שבת שלום {name}! גם בשבת אני פה. תהנה ותאכל לנשמה 😎',
  ],
  evening: [
    'יום מעולה {name}! אכלת מאוזן, הגעת ליעד, ואפילו אימון — מה עוד צריך? 🌙',
    'סיכום: {calories} קק"ל, מאקרו מאוזן. יום של אלופים. לילה טוב! 😴',
    'לא היום הכי טוב, אבל גם ימים כאלה חשובים. מנוחה טובה, מחר נגרוס 💚',
  ],
  workout_suggest: [
    'ארוחה רצינית! 💪 מה דעתך על ריצה קלה של 30 דק\' בעוד שעה?',
    '800 קלוריות? רספקט. אבל בוא נשרוף קצת — אימון כוח 20 דק\'?',
    'ארוחה כבדה = אנרגיה. בוא ננצל את זה! הליכה מהירה 30 דק\' בעוד שעתיים?',
  ],
  balanced_macros: [
    'וואו, המאקרו שלך היום מושלם! חלבון, פחמימות, שומן — כמו מדריך תזונה 📊',
    'איזון מושלם! הגוף שלך מקבל בדיוק מה שהוא צריך. גאה בך! ⚖️',
  ],
  late_night: [
    'אכילת לילה? קורה. רק תנסה/י משהו קל — הגוף צריך לנוח בלילה 🌙',
    '23:30 וארוחה? לא סוף העולם. אבל מחר ננסה לסיים לפני 21:00?',
    'חטיף לילי! אם זה מתוך רעב אמיתי — בסדר גמור. אם מתוך שעמום... אולי כוס תה? 🍵',
  ],
  skipped_breakfast: [
    'כבר 10:00 ולא ראיתי ארוחת בוקר... יש צום מרענן אבל יש גם פשוט שכחת 😅',
    'ארוחת בוקר = דלק ליום. עדיין לא מאוחר — תפוס/י משהו! 🍌',
  ],
};

// ============================================================
// WORKOUT MAP — Calorie ranges to workout suggestions
// ============================================================

export const WORKOUT_MAP: WorkoutMapping[] = [
  {
    label: 'קלה',
    minCal: 0,
    maxCal: 300,
    workouts: [
      { type: 'walk', typeHe: 'הליכה קלה', duration: '15 דק\'', caloriesBurn: 80, waitMinutes: 30, emoji: '🚶', reason: 'ארוחה קלה — שמירה על תנועה' },
      { type: 'stretch', typeHe: 'מתיחות', duration: '15 דק\'', caloriesBurn: 50, waitMinutes: 30, emoji: '🧘', reason: 'ארוחה קלה — גמישות ורגיעה' },
    ],
  },
  {
    label: 'בינונית',
    minCal: 301,
    maxCal: 600,
    workouts: [
      { type: 'brisk_walk', typeHe: 'הליכה מהירה', duration: '20-30 דק\'', caloriesBurn: 180, waitMinutes: 45, emoji: '🏃‍♂️', reason: 'ארוחה בינונית — שריפה יעילה' },
      { type: 'yoga', typeHe: 'יוגה', duration: '20-30 דק\'', caloriesBurn: 150, waitMinutes: 45, emoji: '🧘‍♀️', reason: 'ארוחה בינונית — איזון גוף-נפש' },
      { type: 'cycling', typeHe: 'רכיבה', duration: '20-30 דק\'', caloriesBurn: 200, waitMinutes: 45, emoji: '🚴', reason: 'ארוחה בינונית — קרדיו נהדר' },
    ],
  },
  {
    label: 'כבדה',
    minCal: 601,
    maxCal: 1000,
    workouts: [
      { type: 'running', typeHe: 'ריצה', duration: '25-30 דק\'', caloriesBurn: 300, waitMinutes: 60, emoji: '🏃', reason: 'ארוחה כבדה — שריפת קלוריות מקסימלית' },
      { type: 'strength', typeHe: 'אימון כוח', duration: '25-30 דק\'', caloriesBurn: 250, waitMinutes: 60, emoji: '🏋️', reason: 'ארוחה כבדה — בניית שריר' },
      { type: 'swimming', typeHe: 'שחייה', duration: '25-30 דק\'', caloriesBurn: 280, waitMinutes: 60, emoji: '🏊', reason: 'ארוחה כבדה — אימון גוף מלא' },
    ],
  },
  {
    label: 'כבדה מאוד',
    minCal: 1001,
    maxCal: Infinity,
    workouts: [
      { type: 'long_run', typeHe: 'ריצה ארוכה', duration: '30-45 דק\'', caloriesBurn: 450, waitMinutes: 90, emoji: '🏃‍♂️', reason: 'ארוחה כבדה מאוד — שריפה מרבית' },
      { type: 'hiit', typeHe: 'HIIT', duration: '30-45 דק\'', caloriesBurn: 500, waitMinutes: 90, emoji: '⚡', reason: 'ארוחה כבדה מאוד — אינטנסיבי ויעיל' },
      { type: 'combined', typeHe: 'אימון משולב', duration: '30-45 דק\'', caloriesBurn: 400, waitMinutes: 90, emoji: '💪', reason: 'ארוחה כבדה מאוד — כוח + קרדיו' },
    ],
  },
];

// ============================================================
// MACRO-BASED WORKOUT ADJUSTMENTS
// ============================================================

export const MACRO_WORKOUT_ADJUSTMENTS: Record<string, { preferred: string[]; reason: string }> = {
  high_carbs: {
    preferred: ['running', 'cycling', 'swimming', 'long_run', 'hiit'],
    reason: 'פחמימות = אנרגיה מהירה → קרדיו שורף גליקוגן',
  },
  high_protein: {
    preferred: ['strength', 'combined'],
    reason: 'חלבון = דלק לשרירים → ניצול לבניית שריר',
  },
  high_fat: {
    preferred: ['walk', 'brisk_walk', 'yoga', 'stretch'],
    reason: 'שומן מתעכל לאט → להימנע מאימון אינטנסיבי',
  },
  balanced: {
    preferred: [], // any workout works
    reason: 'מאוזן — כל אימון מתאים',
  },
};

// ============================================================
// TIME-BASED WORKOUT ADJUSTMENTS
// ============================================================

export const TIME_WORKOUT_ADJUSTMENTS: { startHour: number; endHour: number; label: string; adjustment: string }[] = [
  { startHour: 6,  endHour: 10, label: 'בוקר',         adjustment: 'full_range' },
  { startHour: 10, endHour: 14, label: 'צהריים',       adjustment: 'shorter_sessions' },
  { startHour: 14, endHour: 18, label: 'אחר הצהריים',  adjustment: 'full_range' },
  { startHour: 18, endHour: 21, label: 'ערב',          adjustment: 'no_hiit' },
  { startHour: 21, endHour: 6,  label: 'לילה',         adjustment: 'stretch_or_tomorrow' },
];

// ============================================================
// XP REWARDS — every action and its XP value
// ============================================================

export const XP_REWARDS: XPReward[] = [
  { action: 'eating_detected',    xp: 5,    maxPerDay: 6,    description: 'זיהוי ארוחה' },
  { action: 'under_calorie_goal', xp: 20,   maxPerDay: 1,    description: 'עמידה ביעד קלוריות' },
  { action: 'balanced_macros',    xp: 15,   maxPerDay: 1,    description: 'מאקרו מאוזן' },
  { action: 'early_breakfast',    xp: 10,   maxPerDay: 1,    description: 'ארוחת בוקר לפני 9:00' },
  { action: 'workout_confirmed',  xp: 30,   maxPerDay: 2,    description: 'אימון שהושלם' },
  { action: 'streak_3',           xp: 50,   maxPerDay: null, description: 'סטריק 3 ימים' },
  { action: 'streak_7',           xp: 100,  maxPerDay: null, description: 'סטריק 7 ימים' },
  { action: 'streak_14',          xp: 200,  maxPerDay: null, description: 'סטריק 14 ימים' },
  { action: 'streak_30',          xp: 500,  maxPerDay: null, description: 'סטריק 30 ימים' },
  { action: 'log_water',          xp: 3,    maxPerDay: 8,    description: 'רישום כוס מים' },
  { action: 'correct_ai',         xp: 2,    maxPerDay: null, description: 'תיקון זיהוי AI' },
  { action: 'share_achievement',  xp: 5,    maxPerDay: null, description: 'שיתוף הישג' },
];

// ============================================================
// COLORS — full palette (also in tailwind, but accessible in JS)
// ============================================================

export const COLORS = {
  bgDeep: '#0a0a0f',
  bgSurface: '#1a1a2e',
  bgElevated: '#252542',
  bgBorder: 'rgba(255, 255, 255, 0.08)',
  primary: '#00d4aa',
  primaryHover: '#00eebb',
  primaryMuted: 'rgba(0, 212, 170, 0.15)',
  secondary: '#f59e0b',
  secondaryHover: '#fbbf24',
  error: '#ef4444',
  success: '#22c55e',
  purple: '#7c3aed',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  macroProtein: '#3b82f6',
  macroCarbs: '#22c55e',
  macroFat: '#f59e0b',
  calLight: '#22c55e',
  calMedium: '#f59e0b',
  calHeavy: '#ef4444',
} as const;

// ============================================================
// MACRO PRESETS — onboarding diet presets
// ============================================================

export const MACRO_PRESETS: MacroPreset[] = [
  { id: 'balanced',     name: 'מאוזן',          split: { protein: 30, carbs: 40, fat: 30 } },
  { id: 'high_protein', name: 'גבוה חלבון',     split: { protein: 40, carbs: 35, fat: 25 } },
  { id: 'keto',         name: 'קטו',            split: { protein: 25, carbs: 10, fat: 65 } },
];

// ============================================================
// NUDGE LIMITS — notification behavior rules
// ============================================================

export const NUDGE_LIMITS = {
  maxPerHour: 3,
  queueGapMs: 3000,
  toastDurationMs: 5000,
  coachBubbleDurationMs: 8000,
  fullscreenAutoCloseMs: 0, // manual dismiss only
  quietHoursStart: 22,
  quietHoursEnd: 7,
  noEatingThresholdHours: 4,
  postMealWorkoutMinDelayMs: 30 * 60 * 1000,  // 30 min
  postMealWorkoutMaxDelayMs: 90 * 60 * 1000,  // 90 min
  maxWorkoutSuggestionsPerDay: 2,
  sleepHoursStart: 22,
  sleepHoursEnd: 7,
} as const;

// ============================================================
// STREAK MILESTONES — day thresholds with rewards
// ============================================================

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3,   xpReward: 50,   badgeId: null,         visual: '🔥' },
  { days: 7,   xpReward: 100,  badgeId: 'first_week',  visual: '🔥🔥' },
  { days: 14,  xpReward: 200,  badgeId: 'on_fire',     visual: '🔥🔥🔥' },
  { days: 30,  xpReward: 500,  badgeId: 'full_month',  visual: '🔥🔥🔥🔥' },
  { days: 50,  xpReward: 750,  badgeId: null,          visual: '🔥🔥🔥🔥🔥' },
  { days: 100, xpReward: 1500, badgeId: 'diamond',     visual: '💎🔥' },
];

// ============================================================
// RARITY COLORS — badge rarity to color mapping
// ============================================================

export const RARITY_COLORS: Record<string, string> = {
  common: '#22c55e',
  uncommon: '#3b82f6',
  rare: '#a855f7',
  epic: '#f59e0b',
  legendary: '#ef4444',
};

// ============================================================
// DETECTION CONFIG
// ============================================================

export const DETECTION_CONFIG = {
  intervalMs: 2000,        // frame every 2 seconds
  confidenceThreshold: 70, // percent
  dedupWindowMs: 5 * 60 * 1000, // 5 minutes
  maxMealsPerDay: 10,
} as const;

// ============================================================
// ACTIVITY LEVEL LABELS (Hebrew)
// ============================================================

export const ACTIVITY_LEVEL_LABELS: Record<string, string> = {
  sedentary: 'סטטי',
  light: 'פעיל קצת',
  active: 'פעיל',
  athletic: 'ספורטיבי',
};

// ============================================================
// ONBOARDING STRINGS
// ============================================================

export const ONBOARDING = {
  tagline: 'הקלוריות שלך, באוטומט',
  ctaStart: '!בואו נתחיל',
  cameraExplanation: 'קאלאיי צריך גישה למצלמה כדי לזהות מה אתה אוכל. אנחנו לא שומרים וידאו — רק תמונות של אוכל',
  privacyBadge: '🔒 פרטיות מלאה — הכל נשאר במכשיר שלך',
  cameraButton: 'אשר גישה למצלמה',
  howItWorks: 'איך זה עובד?',
  coachIntro: (name: string) =>
    `היי ${name}! אני גל, המאמן האישי שלך. אני אעקוב אחרי מה שאתה אוכל ואעזור לך להגיע ליעדים שלך. מוכנים?`,
  letsGo: '!יאללה',
  postOnboardingCoach: 'מעולה! המצלמה פעילה. תאכל משהו ואני אזהה את זה 😎',
} as const;

// ============================================================
// EMPTY STATE STRINGS
// ============================================================

export const EMPTY_STATE = {
  title: 'עדיין לא אכלת היום',
  subtitle: 'המצלמה פעילה — תאכל משהו ואני אזהה את זה!',
  ready: 'הכל מוכן — בתיאבון! 😋',
} as const;

// ============================================================
// GENERAL UI STRINGS
// ============================================================

export const UI_STRINGS = {
  calories: 'קק"ל',
  caloriesOf: 'מתוך',
  protein: 'חלבון',
  proteinShort: 'ח',
  carbs: 'פחמימות',
  carbsShort: 'פ',
  fat: 'שומן',
  fatShort: 'ש',
  confidence: 'ביטחון',
  edit: 'תקן',
  streak: 'ימים ברצף',
  bestStreak: 'שיא סטריק',
  level: 'רמה',
  xpToday: 'XP היום',
  settings: 'הגדרות',
  searching: '👁️ מחפש...',
  active: '👁️ פעיל',
  cameraOff: 'המצלמה לא פעילה — בדוק חיבור',
  dailySummary: 'סיכום יומי',
  weeklyTrend: 'מגמה שבועית',
  average: 'ממוצע',
  trend: 'מגמה',
  mealsDetected: 'ארוחות שזוהו',
  workoutSuggestions: 'המלצות אימון',
  workoutDone: 'עשיתי!✅',
  workoutLater: 'אח"כ⏰',
  workoutSkip: 'דלג❌',
  workoutTitle: '🏋️ המלצת אימון',
  willBurn: 'ישרפו',
  recommendedIn: 'מומלץ בעוד',
  afterMealOf: 'בעקבות ארוחה של',
  goodNight: 'סגור ולילה טוב 🌙',
  xpEarnedToday: 'XP שהרווחת היום',
  total: 'סה"כ',
  coachVerdict: '🏋️ המסר של גל:',
  freezeUsed: 'החלטה חכמה לשמור על הסטריק! מחר חוזרים 💪',
  // Tab bar
  tabDashboard: '📊דש',
  tabLog: '📋לוג',
  tabWorkout: '🏋️אימון',
  tabProfile: '👤פרופיל',
  // Chart
  hourLabel: 'שעה',
  lightMeal: 'ארוחה קלה',
  mediumMeal: 'ארוחה בינונית',
  heavyMeal: 'ארוחה כבדה',
} as const;

// ============================================================
// GENDER LABELS
// ============================================================

export const GENDER_LABELS: Record<string, string> = {
  male: 'זכר',
  female: 'נקבה',
  other: 'אחר',
};

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================

export const STORAGE_KEYS = {
  profile: 'caleye_profile',
  todayLog: 'caleye_today_log',
  history: 'caleye_history',
  onboarded: 'caleye_onboarded',
  appState: 'caleye_app_state',
} as const;
