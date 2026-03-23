import type { UserProfile, DailyLog, FoodEntry, CoachCategory } from '../types';

// ──────────────────────────────────────────────────
// Coach Messages — All 42 from spec section 4.2
// Organized by CoachCategory.
// [name] is replaced with profile.name at runtime.
// ──────────────────────────────────────────────────

const MESSAGES: Record<CoachCategory, string[]> = {
  // A. Healthy Meal Detected (1-5)
  healthy_meal: [
    'אוו, [name]! שקשוקה? יופי של בחירה. חלבון על הבוקר = מלך 👑',
    'סלט עם חזה עוף? את/ה ברצח היום. +5 XP 💚',
    'ירקות מאודים? מישהו לקח את הבריאות ברצינות! כל הכבוד 🥦',
    'אוכל ביתי! אין כמו. הגוף שלך אומר תודה 🏠',
    'פרוטאין בכל ארוחה — את/ה יודע/ת מה את/ה עושה 💪',
  ],

  // B. Junk Food / Unhealthy Meal (6-10)
  unhealthy_meal: [
    'פיצה? מבין אותך, גם אני לא יכול לעמוד בפני. תהנה, נפצה על זה אחר כך 🍕',
    'המבורגר — קלאסיקה. לא אשפוט, רק אזכיר שהליכה של 30 דק\' תעשה פלאים 😉',
    'נראה שהיום יום חופשי מדיאטה, וזה לגמרי בסדר! מחר חוזרים לעניינים 💪',
    'שוקולד! לפעמים הנשמה צריכה. אם זה מריגע אותך, שווה את זה 🍫',
    'אהה, ארוחה עשירה! בואו נשמור על האנרגיה — אולי הליכה קטנה בהמשך?',
  ],

  // C. Haven't Eaten in 4+ Hours (11-13)
  no_eating: [
    'היי [name], כבר 4 שעות בלי אוכל. הכל בסדר? הגוף צריך דלק ⛽',
    'אוקיי, השעה עוברת ולא ראיתי שום אוכל... לא לשכוח לאכול! 🕐',
    'פרו טיפ: לא לאכול מוריד את חילוף החומרים. תאכל/י משהו קטן לפחות 🥜',
  ],

  // D. Close to Daily Calorie Goal (14-16)
  close_to_goal: [
    'נשאר לך עוד 200 קק"ל ליעד! ארוחת ערב קלה ואת/ה שם 🎯',
    'כמעט! 150 קק"ל ואתה פוגע ביעד. יוגורט + פירות? מושלם 🎯',
    'את/ה ממש קרוב ליעד היום. בואו נסגור את היום בסטייל!',
  ],

  // E. Exceeded Calorie Goal (17-19)
  exceeded_goal: [
    'עברת קצת מהיעד — אבל יום אחד לא הורס כלום. מחר יום חדש! 🌅',
    '100 קלוריות מעל? בכלל לא דרמה. הליכה של 20 דק\' מפצה על זה 🚶',
    'קצת מעל, אבל בסה"כ יום סביר. אל תהיה קשה עם עצמך 💚',
  ],

  // F. Streak Milestone (20-23)
  streak_milestone: [
    '🔥 3 ימים ברצף! זה כבר הרגל! +50 XP',
    'שבוע שלם! 7 ימים ברצף — אתה חיה! 🔥🔥 +100 XP',
    '14 ימים?! את/ה לא עוצר/ת! \'על אש\' badge unlocked! 🏆',
    'חודש! 30 ימים! אני מתרגש יותר ממך כנראה 😂🔥🔥🔥🔥',
  ],

  // G. Level Up (24-26)
  level_up: [
    '🎉 LEVEL UP! ברוכים הבאים לרמה 4 — \'שף טירון\'! הדרך ארוכה אבל אתה רוכב!',
    'רמה 6! \'מאזן מאסטר\' — השם הזה מתאים לך. באמת 💪',
    'אגדת קאלאיי! רמה 10! אני... אני צריך רגע. מרגש. 🥲👑',
  ],

  // H. Morning Greeting (27-29)
  morning: [
    'בוקר טוב [name]! 🌞 יום חדש, הזדמנות חדשה. מה נאכל היום?',
    'בוקר! המצלמה ערה ומוכנה. מתחילים עם ארוחת בוקר?',
    'שבת שלום [name]! גם בשבת אני פה. תהנה ותאכל לנשמה 😎',
  ],

  // I. Evening Summary (30-32)
  evening: [
    'יום מעולה [name]! אכלת מאוזן, הגעת ליעד, ואפילו אימון — מה עוד צריך? 🌙',
    'סיכום: 1,850 קק"ל, מאקרו מאוזן. יום של אלופים. לילה טוב! 😴',
    'לא היום הכי טוב, אבל גם ימים כאלה חשובים. מנוחה טובה, מחר נגרוס 💚',
  ],

  // J. Workout Suggestion After Heavy Meal (33-35)
  workout_suggest: [
    'ארוחה רצינית! 💪 מה דעתך על ריצה קלה של 30 דק\' בעוד שעה?',
    '800 קלוריות? רספקט. אבל בוא נשרוף קצת — אימון כוח 20 דק\'?',
    'ארוחה כבדה = אנרגיה. בוא ננצל את זה! הליכה מהירה 30 דק\' בעוד שעתיים?',
  ],

  // K. Balanced Macros Compliment (36-37)
  balanced_macros: [
    'וואו, המאקרו שלך היום מושלם! חלבון, פחמימות, שומן — כמו מדריך תזונה 📊',
    'איזון מושלם! הגוף שלך מקבל בדיוק מה שהוא צריך. גאה בך! ⚖️',
  ],

  // L. Late Night Eating (38-40)
  late_night: [
    'אכילת לילה? קורה. רק תנסה/י משהו קל — הגוף צריך לנוח בלילה 🌙',
    '23:30 וארוחה? לא סוף העולם. אבל מחר ננסה לסיים לפני 21:00?',
    'חטיף לילי! אם זה מתוך רעב אמיתי — בסדר גמור. אם מתוך שעמום... אולי כוס תה? 🍵',
  ],

  // M. Skipped Breakfast (41-42)
  skipped_breakfast: [
    'כבר 10:00 ולא ראיתי ארוחת בוקר... יש צום מרענן אבל יש גם פשוט שכחת 😅',
    'ארוחת בוקר = דלק ליום. עדיין לא מאוחר — תפוס/י משהו! 🍌',
  ],
};

// Track last used index per category to avoid repeats
const lastUsedIndex: Partial<Record<CoachCategory, number>> = {};

/**
 * Pick a random message from a category, avoiding the last-used one.
 */
function pickRandom(category: CoachCategory): string {
  const pool = MESSAGES[category];
  if (!pool || pool.length === 0) return '';
  if (pool.length === 1) return pool[0] ?? '';

  const lastIdx = lastUsedIndex[category] ?? -1;
  let idx: number;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (idx === lastIdx);

  lastUsedIndex[category] = idx;
  return pool[idx] ?? '';
}

/**
 * Replace [name] placeholder with actual user name.
 */
function personalize(text: string, name: string): string {
  return text.replace(/\[name\]/g, name);
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

interface CoachContext {
  currentCalories?: number;
  remainingCalories?: number;
  streakDays?: number;
  newLevel?: number;
  newLevelName?: string;
}

/**
 * Get a coach message for a given category.
 */
export function getCoachMessage(
  category: CoachCategory,
  profile: UserProfile,
  context?: CoachContext
): string {
  const raw = pickRandom(category);
  return personalize(raw, profile.name);
}

/**
 * Select a morning greeting based on profile and day.
 */
export function selectMorningGreeting(profile: UserProfile): string {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // On Saturday, prefer the Shabbat message (index 2)
  if (dayOfWeek === 6) {
    const msg = MESSAGES.morning[2] ?? '';
    return personalize(msg, profile.name);
  }

  return personalize(pickRandom('morning'), profile.name);
}

/**
 * Select an evening summary message.
 */
export function selectEveningSummary(profile: UserProfile, todayLog: DailyLog): string {
  const metGoal = todayLog.totalCalories <= profile.calorieGoal;
  const hadWorkout = todayLog.xpEarned >= 30;

  // Good day (met goal or did workout)
  if (metGoal && hadWorkout) {
    return personalize(MESSAGES.evening[0] ?? '', profile.name);
  }

  // Decent day
  if (metGoal) {
    return personalize(MESSAGES.evening[1] ?? '', profile.name);
  }

  // Not great day
  return personalize(MESSAGES.evening[2] ?? '', profile.name);
}

// ──────────────────────────────────────────────────
// Unhealthy food keywords for classification
// ──────────────────────────────────────────────────

const UNHEALTHY_KEYWORDS = [
  'פיצה', 'המבורגר', 'שוקולד', 'צ\'יפס', 'נקניקיה', 'שניצל',
  'גלידה', 'עוגה', 'סופגניה', 'קרואסון', 'וופל', 'נאגטס',
  'pizza', 'hamburger', 'burger', 'chocolate', 'chips', 'fries',
  'ice cream', 'cake', 'donut', 'croissant', 'waffle', 'nuggets',
  'hotdog', 'hot dog', 'candy', 'cookie', 'cookies', 'soda',
  'ממתק', 'סוכריה', 'בורקס', 'שווארמה',
];

/**
 * Determine if a food entry is "healthy" or "unhealthy" and return the appropriate message.
 */
export function getPostMealMessage(entry: FoodEntry, profile: UserProfile): string {
  const foodLower = (entry.food + ' ' + entry.foodHe).toLowerCase();
  const isUnhealthy = UNHEALTHY_KEYWORDS.some(kw => foodLower.includes(kw.toLowerCase()));

  // High calorie meals (600+) also lean toward unhealthy message
  const isHighCal = entry.calories >= 600;

  if (isUnhealthy || isHighCal) {
    return personalize(pickRandom('unhealthy_meal'), profile.name);
  }

  return personalize(pickRandom('healthy_meal'), profile.name);
}

/**
 * Get a message about not eating for a while.
 */
export function getNoEatingMessage(hoursSinceLastMeal: number, profile?: UserProfile): string {
  const msg = pickRandom('no_eating');
  const name = profile?.name ?? '';
  return personalize(msg, name);
}

/**
 * Get a message about calorie goal status.
 */
export function getGoalMessage(
  currentCal: number,
  goalCal: number,
  profile?: UserProfile
): string {
  const remaining = goalCal - currentCal;
  const name = profile?.name ?? '';

  // Under goal, close (within 300)
  if (remaining > 0 && remaining <= 300) {
    return personalize(pickRandom('close_to_goal'), name);
  }

  // Exceeded goal
  if (remaining < 0) {
    return personalize(pickRandom('exceeded_goal'), name);
  }

  // Far from goal — no specific message needed
  return '';
}

/**
 * Check if a late night eating message should be sent (after 21:00).
 */
export function isLateNightEating(timestamp: number): boolean {
  const hour = new Date(timestamp).getHours();
  return hour >= 21;
}

/**
 * Get all messages for a category (for debugging/testing).
 */
export function getAllMessages(): Record<CoachCategory, string[]> {
  return { ...MESSAGES };
}
