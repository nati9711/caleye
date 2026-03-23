import type { UserProfile, DailyLog, Badge, BadgeRarity, Level } from '../types';

// ──────────────────────────────────────────────────
// XP Values (spec section 3.1)
// ──────────────────────────────────────────────────

export type XPAction =
  | 'eating_detected'
  | 'under_calorie_goal'
  | 'balanced_macros'
  | 'first_meal_before_9'
  | 'workout_confirmed'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_50'
  | 'streak_100'
  | 'water_logged'
  | 'ai_correction'
  | 'share_achievement';

interface XPActionDef {
  xp: number;
  maxPerDay: number | null;
}

const XP_VALUES: Record<XPAction, XPActionDef> = {
  eating_detected:      { xp: 5,    maxPerDay: 6 },
  under_calorie_goal:   { xp: 20,   maxPerDay: 1 },
  balanced_macros:      { xp: 15,   maxPerDay: 1 },
  first_meal_before_9:  { xp: 10,   maxPerDay: 1 },
  workout_confirmed:    { xp: 30,   maxPerDay: 2 },
  streak_3:             { xp: 50,   maxPerDay: null },
  streak_7:             { xp: 100,  maxPerDay: null },
  streak_14:            { xp: 200,  maxPerDay: null },
  streak_30:            { xp: 500,  maxPerDay: null },
  streak_50:            { xp: 750,  maxPerDay: null },
  streak_100:           { xp: 1500, maxPerDay: null },
  water_logged:         { xp: 3,    maxPerDay: 8 },
  ai_correction:        { xp: 2,    maxPerDay: null },
  share_achievement:    { xp: 5,    maxPerDay: null },
};

interface XPContext {
  timesUsedToday?: number;
}

/**
 * Calculate XP for a given action, respecting daily caps.
 */
export function calculateXPForAction(action: XPAction, context?: XPContext): number {
  const def = XP_VALUES[action];
  if (!def) return 0;

  if (def.maxPerDay !== null && context?.timesUsedToday !== undefined) {
    if (context.timesUsedToday >= def.maxPerDay) return 0;
  }

  return def.xp;
}

// ──────────────────────────────────────────────────
// Level System (spec section 3.2)
// ──────────────────────────────────────────────────

const LEVELS: Level[] = [
  { level: 1,  name: 'טירון',           xpRequired: 0,     totalXP: 0 },
  { level: 2,  name: 'טועם',            xpRequired: 100,   totalXP: 100 },
  { level: 3,  name: 'טעמן',            xpRequired: 250,   totalXP: 350 },
  { level: 4,  name: 'שף טירון',        xpRequired: 400,   totalXP: 750 },
  { level: 5,  name: 'בריאן',           xpRequired: 600,   totalXP: 1350 },
  { level: 6,  name: 'מאזן מאסטר',      xpRequired: 800,   totalXP: 2150 },
  { level: 7,  name: 'אלוף התזונה',     xpRequired: 1000,  totalXP: 3150 },
  { level: 8,  name: 'לוחם כושר',       xpRequired: 1500,  totalXP: 4650 },
  { level: 9,  name: 'גורו הבריאות',    xpRequired: 2000,  totalXP: 6650 },
  { level: 10, name: 'אגדת קאלאיי',     xpRequired: 3000,  totalXP: 9650 },
  { level: 11, name: 'מאסטר שף',        xpRequired: 4000,  totalXP: 13650 },
  { level: 12, name: 'נינג\'ה תזונתי',  xpRequired: 5000,  totalXP: 18650 },
  { level: 13, name: 'טיטאן הבריאות',   xpRequired: 7000,  totalXP: 25650 },
  { level: 14, name: 'אליל העל',        xpRequired: 10000, totalXP: 35650 },
  { level: 15, name: '∞ מעבר לגבול',    xpRequired: 15000, totalXP: 50650 },
];

/**
 * Get the Level object for a given total XP amount.
 */
export function getLevelForXP(totalXP: number): Level {
  let result = LEVELS[0]!;
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.totalXP) {
      result = lvl;
    } else {
      break;
    }
  }
  return result;
}

/**
 * Get XP progress within the current level.
 */
export function getXPProgress(totalXP: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const currentLevel = getLevelForXP(totalXP);
  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];

  if (!nextLevel) {
    return { current: 0, needed: 0, percentage: 100 };
  }

  const xpIntoCurrentLevel = totalXP - currentLevel.totalXP;
  const xpNeededForNext = nextLevel.totalXP - currentLevel.totalXP;
  const percentage = Math.min(100, Math.round((xpIntoCurrentLevel / xpNeededForNext) * 100));

  return {
    current: xpIntoCurrentLevel,
    needed: xpNeededForNext,
    percentage,
  };
}

/**
 * Get all levels (for display).
 */
export function getAllLevels(): Level[] {
  return [...LEVELS];
}

// ──────────────────────────────────────────────────
// Badge System (spec section 3.3)
// ──────────────────────────────────────────────────

const ALL_BADGES: Badge[] = [
  {
    id: 'first_step',
    emoji: '👶',
    name: 'צעד ראשון',
    description: 'הארוחה הראשונה שזוהתה',
    unlockCondition: 'First food detection',
    rarity: 'common',
    checkUnlock: (_profile, log) => log.entries.length > 0,
  },
  {
    id: 'first_week',
    emoji: '📅',
    name: 'שבוע ראשון',
    description: 'שרדת שבוע שלם!',
    unlockCondition: '7-day streak',
    rarity: 'common',
    checkUnlock: (profile) => profile.currentStreak >= 7,
  },
  {
    id: 'balanced',
    emoji: '⚖️',
    name: 'מאוזן',
    description: 'מאקרו מושלם ביום שלם',
    unlockCondition: 'All macros within 5% of target',
    rarity: 'uncommon',
    checkUnlock: (profile, log) => {
      if (log.totalCalories <= 0) return false;
      const pPct = (log.totalProtein * 4) / log.totalCalories * 100;
      const cPct = (log.totalCarbs * 4) / log.totalCalories * 100;
      const fPct = (log.totalFat * 9) / log.totalCalories * 100;
      return (
        Math.abs(pPct - profile.macroSplit.protein) <= 5 &&
        Math.abs(cPct - profile.macroSplit.carbs) <= 5 &&
        Math.abs(fPct - profile.macroSplit.fat) <= 5
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
    // Requires external counter; checked via checkBadgeUnlocks context
    checkUnlock: () => false,
  },
  {
    id: 'on_fire',
    emoji: '🔥',
    name: 'על אש',
    description: 'סטריק של 14 יום',
    unlockCondition: '14-day streak',
    rarity: 'rare',
    checkUnlock: (profile) => profile.currentStreak >= 14,
  },
  {
    id: 'calorie_sniper',
    emoji: '🎯',
    name: 'צלף קלורי',
    description: 'פגעת ביעד ±50 קק"ל',
    unlockCondition: 'Hit calorie goal within +/-50 kcal',
    rarity: 'uncommon',
    checkUnlock: (profile, log) =>
      log.totalCalories > 0 &&
      Math.abs(log.totalCalories - profile.calorieGoal) <= 50,
  },
  {
    id: 'sporty',
    emoji: '💪',
    name: 'ספורטיבי',
    description: 'השלמת 10 אימונים',
    unlockCondition: 'Confirm 10 workouts',
    rarity: 'rare',
    checkUnlock: (profile) => profile.workoutsConfirmed >= 10,
  },
  {
    id: 'healthy_owl',
    emoji: '🌙',
    name: 'ינשוף בריא',
    description: 'לא אכלת אחרי 21:00, 7 ימים',
    unlockCondition: 'No food after 21:00 for 7 days',
    rarity: 'rare',
    // Requires external counter; checked via checkBadgeUnlocks context
    checkUnlock: () => false,
  },
  {
    id: 'green_green',
    emoji: '🥗',
    name: 'ירוק ירוק',
    description: '5 ארוחות בריאות ברצף',
    unlockCondition: '5 consecutive healthy meals',
    rarity: 'uncommon',
    // Requires external counter; checked via checkBadgeUnlocks context
    checkUnlock: () => false,
  },
  {
    id: 'machine_teacher',
    emoji: '🧠',
    name: 'מלמד מכונה',
    description: 'תיקנת את ה-AI 20 פעם',
    unlockCondition: 'Correct AI detection 20 times',
    rarity: 'rare',
    checkUnlock: (profile) => profile.foodCorrections >= 20,
  },
  {
    id: 'full_month',
    emoji: '🏆',
    name: 'חודש מלא',
    description: 'סטריק של 30 יום!',
    unlockCondition: '30-day streak',
    rarity: 'epic',
    checkUnlock: (profile) => profile.currentStreak >= 30,
  },
  {
    id: 'diverse',
    emoji: '🌈',
    name: 'מגוון',
    description: 'אכלת 20 מאכלים שונים',
    unlockCondition: '20 unique foods detected',
    rarity: 'uncommon',
    checkUnlock: (profile) => profile.uniqueFoodsDetected.length >= 20,
  },
  {
    id: 'fast_powerful',
    emoji: '⚡',
    name: 'מהיר ועוצמתי',
    description: '3 אימונים בשבוע, 4 שבועות',
    unlockCondition: '3+ workouts/week for 4 weeks',
    rarity: 'epic',
    // Requires external weekly workout counter; checked via checkBadgeUnlocks context
    checkUnlock: () => false,
  },
  {
    id: 'caleye_king',
    emoji: '👑',
    name: 'מלך הקאלאיי',
    description: 'הגעת לרמה 10',
    unlockCondition: 'Reach level 10',
    rarity: 'epic',
    checkUnlock: (profile) => getLevelForXP(profile.totalXP).level >= 10,
  },
  {
    id: 'diamond',
    emoji: '💎',
    name: 'יהלום',
    description: '100 יום סטריק',
    unlockCondition: '100-day streak',
    rarity: 'legendary',
    checkUnlock: (profile) => profile.currentStreak >= 100,
  },
];

/**
 * Get all badge definitions.
 */
export function getAllBadges(): Badge[] {
  return [...ALL_BADGES];
}

/**
 * Get a single badge by ID.
 */
export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find(b => b.id === id);
}

interface BadgeCheckContext {
  consecutiveHealthyMeals?: number;
  earlyBreakfastCount?: number;
  noLateEatingDays?: number;
  weeklyWorkouts?: number[];
}

/**
 * Check which badges should be unlocked based on current profile and today's log.
 * Returns only NEWLY unlocked badges (not already in profile.badges).
 */
export function checkBadgeUnlocks(
  profile: UserProfile,
  todayLog: DailyLog,
  context?: BadgeCheckContext
): Badge[] {
  const newBadges: Badge[] = [];
  const earned = new Set(profile.badges);

  for (const badge of ALL_BADGES) {
    if (earned.has(badge.id)) continue;

    // First try the badge's own checkUnlock
    let unlocked = badge.checkUnlock(profile, todayLog);

    // For badges that need external counters, check via context
    if (!unlocked && context) {
      switch (badge.id) {
        case 'early_bird':
          unlocked = (context.earlyBreakfastCount ?? 0) >= 5;
          break;
        case 'healthy_owl':
          unlocked = (context.noLateEatingDays ?? 0) >= 7;
          break;
        case 'green_green':
          unlocked = (context.consecutiveHealthyMeals ?? 0) >= 5;
          break;
        case 'fast_powerful':
          if (context.weeklyWorkouts && context.weeklyWorkouts.length >= 4) {
            unlocked = context.weeklyWorkouts.slice(-4).every(w => w >= 3);
          }
          break;
      }
    }

    if (unlocked) {
      newBadges.push(badge);
    }
  }

  return newBadges;
}

// ──────────────────────────────────────────────────
// Streak System (spec section 3.4)
// ──────────────────────────────────────────────────

interface StreakResult {
  newStreak: number;
  brokeStreak: boolean;
  milestone?: { days: number; xp: number };
  usedFreeze: boolean;
}

const STREAK_MILESTONES = [
  { days: 3,   xp: 50 },
  { days: 7,   xp: 100 },
  { days: 14,  xp: 200 },
  { days: 30,  xp: 500 },
  { days: 50,  xp: 750 },
  { days: 100, xp: 1500 },
];

/**
 * Update streak based on today's date vs last active date.
 */
export function updateStreak(profile: UserProfile, today: string): StreakResult {
  const lastDate = profile.lastActiveDate;

  // First ever activity
  if (!lastDate) {
    const newStreak = 1;
    const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
    return { newStreak, brokeStreak: false, milestone, usedFreeze: false };
  }

  const todayDate = new Date(today);
  const lastActiveDate = new Date(lastDate);
  const diffTime = todayDate.getTime() - lastActiveDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Same day
  if (diffDays === 0) {
    return {
      newStreak: profile.currentStreak,
      brokeStreak: false,
      milestone: undefined,
      usedFreeze: false,
    };
  }

  // Consecutive day
  if (diffDays === 1) {
    const newStreak = profile.currentStreak + 1;
    const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
    return { newStreak, brokeStreak: false, milestone, usedFreeze: false };
  }

  // Missed one day — try freeze
  if (diffDays === 2 && canUseStreakFreeze(profile)) {
    const newStreak = profile.currentStreak + 1;
    const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
    return { newStreak, brokeStreak: false, milestone, usedFreeze: true };
  }

  // Streak broken
  return { newStreak: 1, brokeStreak: true, milestone: undefined, usedFreeze: false };
}

/**
 * Check if user can use a streak freeze.
 * 1 free per week, additional cost 50 XP each (max 2 per week).
 */
export function canUseStreakFreeze(profile: UserProfile): boolean {
  return profile.streakFreezesUsed < 1;
}

/**
 * Get streak milestone definitions.
 */
export function getStreakMilestones() {
  return [...STREAK_MILESTONES];
}

/**
 * Get the display color for a badge rarity.
 */
export function getRarityColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':    return '#22c55e';
    case 'uncommon':  return '#3b82f6';
    case 'rare':      return '#a855f7';
    case 'epic':      return '#eab308';
    case 'legendary': return '#ef4444';
  }
}
