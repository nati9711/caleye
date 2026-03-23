# CalEye (קאלאיי) — App Design Specification
## AI-Powered Webcam Food Tracker

> **Version:** 1.0 | **Date:** 2026-03-23 | **Language:** Hebrew (RTL) | **Theme:** Dark + Health-Green

---

## Table of Contents

1. [App Flow (זרימת האפליקציה)](#1-app-flow-זרימת-האפליקציה)
2. [Dashboard Layout (מבנה הדשבורד)](#2-dashboard-layout-מבנה-הדשבורד)
3. [Gamification System (מערכת גיימיפיקציה)](#3-gamification-system-מערכת-גיימיפיקציה)
4. [AI Coach Personality (אישיות המאמן)](#4-ai-coach-personality-אישיות-המאמן)
5. [Workout Suggestions Logic (לוגיקת המלצות אימון)](#5-workout-suggestions-logic-לוגיקת-המלצות-אימון)
6. [Smart Nudges System (מערכת דחיפות חכמות)](#6-smart-nudges-system-מערכת-דחיפות-חכמות)
7. [Data Display Specs (תצוגת נתונים)](#7-data-display-specs-תצוגת-נתונים)
8. [Color & Visual Specs (צבעים ועיצוב)](#8-color--visual-specs-צבעים-ועיצוב)
9. [Animation Specs (אנימציות)](#9-animation-specs-אנימציות)
10. [Edge Cases & Smart Behavior (מקרי קצה)](#10-edge-cases--smart-behavior-מקרי-קצה)

---

## 1. App Flow (זרימת האפליקציה)

### 1.1 First-Time User Experience (אונבורדינג)

The onboarding is a 5-step wizard with progress dots. Each step is a full-screen card with a single focus, animated transitions between steps, and a skip option (not recommended).

**Step 1 — Welcome Screen**
- Large CalEye logo with subtle glow animation
- Tagline: "הקלוריות שלך, באוטומט" (Your calories, on autopilot)
- Single CTA button: "!בואו נתחיל" (Let's go!)
- Background: dark with floating food emoji particles (subtle, slow drift)

**Step 2 — Camera Permission**
- Illustration: friendly eye icon watching a plate
- Explanation text: "קאלאיי צריך גישה למצלמה כדי לזהות מה אתה אוכל. אנחנו לא שומרים וידאו — רק תמונות של אוכל"
- Privacy badge: "🔒 פרטיות מלאה — הכל נשאר במכשיר שלך"
- Button: "אשר גישה למצלמה"
- Secondary link: "איך זה עובד?" → expandable FAQ

**Step 3 — Personal Details**
- Name (for coach personalization)
- Gender (male/female/other — affects calorie calculations)
- Age, height, weight (with metric toggles)
- Activity level: סטטי / פעיל קצת / פעיל / ספורטיבי (Sedentary / Lightly Active / Active / Athletic)
- All fields have playful micro-animations on focus

**Step 4 — Daily Goals**
- Calorie goal: auto-calculated from Step 3 data (with manual override slider)
- Macro split: Preset options:
  - "מאוזן" (Balanced): 30% protein / 40% carbs / 30% fat
  - "גבוה חלבון" (High Protein): 40% / 35% / 25%
  - "קטו" (Keto): 25% / 10% / 65%
  - "מותאם אישית" (Custom): manual sliders
- Visual ring chart updates live as user adjusts

**Step 5 — Meet Your Coach**
- Coach avatar introduction (animated entrance)
- Coach says: "היי [name]! אני גל, המאמן האישי שלך. אני אעקוב אחרי מה שאתה אוכל ואעזור לך להגיע ליעדים שלך. מוכנים?"
- Button: "!יאללה" (Let's go!)
- Confetti animation on tap

**Post-Onboarding:**
- Camera activates immediately
- Coach bubble: "מעולה! המצלמה פעילה. תאכל משהו ואני אזהה את זה 😎"
- Dashboard loads with empty state (see section 2.5)

### 1.2 Main Screen Layout

The main screen is the dashboard (see section 2 for full layout). The webcam feed runs as a small floating PiP (picture-in-picture) window in the corner. The dashboard is always visible and updates in real-time.

**States:**
- **Idle (between meals):** Dashboard visible, webcam PiP showing "👁️ מחפש..." status, coach avatar idle
- **Eating detected:** Toast notification, food card appears in log, dashboard numbers animate up
- **Reviewing food log:** Scroll through past detections with thumbnails
- **Settings/Profile:** Slide-out panel from right (RTL)

### 1.3 Eating Detection Flow

```
Webcam frame (every 2s)
    ↓
Gemini Vision API analysis
    ↓
Food detected? (confidence > 70%)
    ├── NO → continue watching
    └── YES →
        ├── Dedup check (same food within 5 min?)
        │   ├── YES → skip (increment portion if confidence higher)
        │   └── NO →
        │       ├── Capture frame as thumbnail
        │       ├── Identify food name (Hebrew)
        │       ├── Estimate calories + macros
        │       ├── Show toast notification
        │       ├── Add to food log
        │       ├── Update dashboard numbers (animated)
        │       ├── Award XP (+5)
        │       └── Queue post-meal workout nudge (30 min timer)
```

**Toast Notification Content:**
```
┌─────────────────────────────────────┐
│ 🍕 פיצה מרגריטה          285 קק"ל │
│ ח: 12g  |  פ: 10g  |  ש: 36g      │
│ ביטחון: 87%    [✏️ תקן]           │
└─────────────────────────────────────┘
```

### 1.4 Between Meals Behavior

- Dashboard displays current daily totals
- Webcam PiP shows green dot ("active") with "👁️ מחפש..." text
- Coach avatar is in idle state (subtle breathing animation)
- After 4 hours with no detection → coach nudge (see section 6)
- Hourly chart updates with empty bars for passed hours
- User can scroll food log, check stats, view badges

### 1.5 End of Day Summary Flow

**Triggered at:** 22:00 (configurable in settings)

**Summary Card (Full-Screen Overlay):**

```
Step 1 — Daily Recap
┌──────────────────────────────────┐
│         📊 סיכום יומי            │
│         יום שלישי, 23.3          │
│                                  │
│      ╭─────────╮                 │
│      │  1,847  │ קק"ל            │
│      ╰─────────╯                 │
│                                  │
│  חלבון    פחמימות    שומן         │
│   98g      210g      72g         │
│   21%      46%       33%         │
│  [===]    [=====]   [===]        │
│                                  │
│  ארוחות שזוהו: 4                 │
│  המלצות אימון: 2                 │
└──────────────────────────────────┘

Step 2 — XP Summary
┌──────────────────────────────────┐
│         ⭐ XP שהרווחת היום       │
│                                  │
│  אכילה זוהתה ×4      +20 XP     │
│  מאזן מאקרו טוב      +15 XP     │
│  ארוחה לפני 9:00     +10 XP     │
│  ─────────────────────────       │
│  סה"כ:               +45 XP     │
│                                  │
│  Level 3: "טעמן" ████████░░ 72%  │
└──────────────────────────────────┘

Step 3 — Coach Verdict
┌──────────────────────────────────┐
│  🏋️ המסר של גל:                │
│                                  │
│  "יום מעולה [name]! אכלת מאוזן, │
│   הצלחת לשמור על היעד, ואפילו   │
│   אכלת ארוחת בוקר מוקדם.        │
│   עוד יום כזה ואתה ב-streak     │
│   של 3 ימים! 🔥"                │
│                                  │
│  [סגור ולילה טוב 🌙]            │
└──────────────────────────────────┘
```

---

## 2. Dashboard Layout (מבנה הדשבורד)

### 2.1 Desktop Layout (ASCII Mockup)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                                │
│  ┌──────┐   CalEye   🔥 12 streak    ⭐ Level 4: "שף טירון"    ⚙️ הגדרות │
│  │ LOGO │                                                                  │
│  └──────┘                                                                  │
├─────────────────────────────────────────────────────────────┬──────────────┤
│                                                             │              │
│  ┌─── DAILY SUMMARY CARD ─────────────────────────────┐    │  ┌────────┐  │
│  │                                                     │    │  │WEBCAM  │  │
│  │   ╭──────╮   ╭──────────────────╮                   │    │  │  PiP   │  │
│  │   │1,247 │   │   ◯ MACRO RING   │   XP Today: +45  │    │  │        │  │
│  │   │קק"ל  │   │  P:21% C:46%    │   ████████░░ 72%  │    │  │👁️ פעיל│  │
│  │   ╰──────╯   │  F:33%          │                    │    │  └────────┘  │
│  │               ╰──────────────────╯                   │    │              │
│  └─────────────────────────────────────────────────────┘    │  ┌────────┐  │
│                                                             │  │ COACH  │  │
│  ┌─── HOURLY CALORIE CHART ───────────────────────────┐    │  │ AVATAR │  │
│  │                                                     │    │  │  "גל"  │  │
│  │  400 ┤                                              │    │  │        │  │
│  │  300 ┤     ██                          ██           │    │  │ "יום   │  │
│  │  200 ┤     ██  ██                      ██           │    │  │  טוב!" │  │
│  │  100 ┤ ██  ██  ██              ██      ██           │    │  └────────┘  │
│  │    0 ┼──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──       │    │              │
│  │       7  8  9 10 11 12 13 14 15 16 17 18 19         │    │  ┌────────┐  │
│  │                    שעה ביום                          │    │  │WORKOUT │  │
│  └─────────────────────────────────────────────────────┘    │  │SUGGEST │  │
│                                                             │  │        │  │
│  ┌─── FOOD LOG ───────────────────────────────────────┐    │  │🏃 ריצה │  │
│  │                                                     │    │  │ 30 דק' │  │
│  │  ┌─────┐  12:30 — פיצה מרגריטה                     │    │  └────────┘  │
│  │  │ IMG │  285 קק"ל | ח:12g פ:10g ש:36g | 87%      │    │              │
│  │  └─────┘                                            │    │  ┌────────┐  │
│  │  ────────────────────────────────────────           │    │  │BADGES  │  │
│  │  ┌─────┐  09:15 — ביצים + לחם                      │    │  │        │  │
│  │  │ IMG │  320 קק"ל | ח:22g פ:8g ש:28g | 92%       │    │  │🏅🏅🏅  │  │
│  │  └─────┘                                            │    │  │ 5/15   │  │
│  │  ────────────────────────────────────────           │    │  └────────┘  │
│  │  ┌─────┐  07:45 — שקשוקה                           │    │              │
│  │  │ IMG │  380 קק"ל | ח:18g פ:14g ש:32g | 95%      │    │              │
│  │  └─────┘                                            │    │              │
│  │                                                     │    │              │
│  └─────────────────────────────────────────────────────┘    │              │
│                                                             │              │
└─────────────────────────────────────────────────────────────┴──────────────┘
```

### 2.2 Element Positioning (Desktop)

| Zone | Content | Width | Position |
|------|---------|-------|----------|
| Header | Logo, streak, level, settings | 100% | Top, fixed |
| Main Left | Summary card, hourly chart, food log | ~70% | Scrollable |
| Sidebar Right | Webcam PiP, coach, workout, badges | ~30% | Fixed/sticky |

### 2.3 Mobile Layout (ASCII Mockup)

```
┌──────────────────────────┐
│  HEADER (compact)        │
│  CalEye  🔥12  ⭐Lv4  ⚙️│
├──────────────────────────┤
│                          │
│  ┌── DAILY SUMMARY ───┐ │
│  │  1,247   ◯ MACROS  │ │
│  │  קק"ל   P:21%     │ │
│  │          C:46%     │ │
│  │  +45 XP  F:33%     │ │
│  └────────────────────┘ │
│                          │
│  ┌── HOURLY CHART ────┐ │
│  │  (horizontal scroll │ │
│  │   for 24h bars)     │ │
│  └────────────────────┘ │
│                          │
│  ┌── FOOD LOG ────────┐ │
│  │ [img] 12:30 פיצה   │ │
│  │       285 קק"ל     │ │
│  │ ─────────────────── │ │
│  │ [img] 09:15 ביצים  │ │
│  │       320 קק"ל     │ │
│  └────────────────────┘ │
│                          │
├──────────────────────────┤
│  TAB BAR                 │
│  📊דש  📋לוג  🏋️אימון  👤פרופיל│
└──────────────────────────┘

  ┌──────────┐
  │ WEBCAM   │  ← Floating FAB
  │   PiP    │     bottom-left
  │ (draggable)    64×64px
  └──────────┘
```

### 2.4 Mobile Adaptations

- **Webcam PiP:** Floating draggable circle (64px), bottom-left, tap to expand
- **Coach messages:** Bottom sheet that slides up, not sidebar
- **Hourly chart:** Horizontal scroll instead of full-width
- **Food log:** Compact cards, tap to expand details
- **Tab bar:** 4 tabs — Dashboard / Food Log / Workout / Profile
- **Notifications:** Native-style toasts at top

### 2.5 Empty State (Day Start / New User)

```
┌─────────────────────────────────────┐
│                                     │
│         🍽️                          │
│   "עדיין לא אכלת היום"             │
│   "המצלמה פעילה — תאכל משהו        │
│    ואני אזהה את זה!"               │
│                                     │
│   ╭──────────────╮                  │
│   │  0 קק"ל     │                  │
│   │  מתוך 2,000  │                  │
│   ╰──────────────╯                  │
│                                     │
│   [הכל מוכן — בתיאבון! 😋]        │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Gamification System (מערכת גיימיפיקציה)

### 3.1 XP System

XP (Experience Points) is the core currency. Earned through healthy behaviors, never lost (no punishment mechanics).

| Action | XP | Frequency | Notes |
|--------|----|-----------|-------|
| Eating detected | +5 | Per meal | Max 6/day (30 XP cap) |
| Staying under calorie goal | +20 | Daily | Checked at end of day |
| Balanced macros (within 10% of target) | +15 | Daily | All three macros must qualify |
| First meal before 9:00 AM | +10 | Daily | "Early bird" bonus |
| Going for a workout (user confirms) | +30 | Per workout | Max 2/day |
| 3-day streak | +50 | Once per streak tier | Bonus, stacks with daily |
| 7-day streak | +100 | Once per streak tier | |
| 14-day streak | +200 | Once per streak tier | |
| 30-day streak | +500 | Once per streak tier | |
| Logging water (manual) | +3 | Per glass | Max 8/day (24 XP cap) |
| Correcting AI detection | +2 | Per correction | Helps AI learn + rewards engagement |
| Sharing achievement | +5 | Per share | Social engagement |

**Daily XP Potential:**
- Minimum (just eating): ~15-30 XP
- Average active user: ~60-80 XP
- Power user (all bonuses): ~120-150 XP

### 3.2 Level System

Levels are food/health themed with creative Hebrew names. XP thresholds follow a curve (each level requires more XP).

| Level | Name (Hebrew) | Translation | XP Required | Total XP | Unlock |
|-------|--------------|-------------|-------------|----------|--------|
| 1 | טירון | Rookie | 0 | 0 | Start |
| 2 | טועם | Taster | 100 | 100 | First day complete |
| 3 | טעמן | Flavor Seeker | 250 | 350 | ~3-4 days |
| 4 | שף טירון | Rookie Chef | 400 | 750 | ~1 week |
| 5 | בריאן | Health Nut | 600 | 1,350 | ~2 weeks |
| 6 | מאזן מאסטר | Balance Master | 800 | 2,150 | ~3 weeks |
| 7 | אלוף התזונה | Nutrition Champion | 1,000 | 3,150 | ~1 month |
| 8 | לוחם כושר | Fitness Warrior | 1,500 | 4,650 | ~6 weeks |
| 9 | גורו הבריאות | Health Guru | 2,000 | 6,650 | ~2 months |
| 10 | אגדת קאלאיי | CalEye Legend | 3,000 | 9,650 | ~3 months |
| 11 | מאסטר שף | Master Chef | 4,000 | 13,650 | ~4.5 months |
| 12 | נינג'ה תזונתי | Nutrition Ninja | 5,000 | 18,650 | ~6 months |
| 13 | טיטאן הבריאות | Health Titan | 7,000 | 25,650 | ~9 months |
| 14 | אליל העל | The Supreme | 10,000 | 35,650 | ~1 year |
| 15 | ∞ מעבר לגבול | Beyond the Limit | 15,000 | 50,650 | ~1.5 years |

**Level-Up Rewards:**
- Levels 2-5: New coach messages unlocked
- Levels 6-8: Dashboard theme color options
- Levels 9-10: Coach avatar customization
- Levels 11-13: Custom badge frames
- Levels 14-15: Exclusive "legendary" visual effects

### 3.3 Badges & Achievements System

Each badge has: emoji icon, Hebrew name, description, unlock condition, rarity tier.

**Rarity Tiers:**
- 🟢 Common — most users get these
- 🔵 Uncommon — requires consistency
- 🟣 Rare — requires dedication
- 🟡 Epic — significant achievement
- 🔴 Legendary — exceptional commitment

| # | Emoji | Name | Description | Unlock Condition | Rarity |
|---|-------|------|-------------|------------------|--------|
| 1 | 👶 | צעד ראשון | הארוחה הראשונה שזוהתה | First food detection | 🟢 |
| 2 | 📅 | שבוע ראשון | שרדת שבוע שלם! | 7-day streak | 🟢 |
| 3 | ⚖️ | מאוזן | מאקרו מושלם ביום שלם | All macros within 5% of target | 🔵 |
| 4 | 🐦 | ציפור מוקדמת | ארוחת בוקר לפני 8:00 | Eat before 8:00 AM, 5 times | 🔵 |
| 5 | 🔥 | על אש | סטריק של 14 יום | 14-day streak | 🟣 |
| 6 | 🎯 | צלף קלורי | פגעת ביעד ±50 קק"ל | Hit calorie goal within ±50 kcal | 🔵 |
| 7 | 💪 | ספורטיבי | השלמת 10 אימונים | Confirm 10 workouts | 🟣 |
| 8 | 🌙 | ינשוף בריא | לא אכלת אחרי 21:00, 7 ימים | No food after 21:00 for 7 days | 🟣 |
| 9 | 🥗 | ירוק ירוק | 5 ארוחות בריאות ברצף | 5 consecutive healthy meals (AI tagged) | 🔵 |
| 10 | 🧠 | מלמד מכונה | תיקנת את ה-AI 20 פעם | Correct AI detection 20 times | 🟣 |
| 11 | 🏆 | חודש מלא | סטריק של 30 יום! | 30-day streak | 🟡 |
| 12 | 🌈 | מגוון | אכלת 20 מאכלים שונים | 20 unique foods detected | 🔵 |
| 13 | ⚡ | מהיר ועוצמתי | 3 אימונים בשבוע, 4 שבועות | 3+ workouts/week for 4 weeks | 🟡 |
| 14 | 👑 | מלך הקאלאיי | הגעת לרמה 10 | Reach level 10 | 🟡 |
| 15 | 💎 | יהלום | 100 יום סטריק | 100-day streak | 🔴 |

**Badge Display:**
- Earned badges: full color with glow
- Locked badges: grayscale silhouette with "?" and hint text
- New badge: spin + glow unlock animation (see section 9)
- Badge shelf in profile: grid layout, sorted by rarity

### 3.4 Streak System

**How It Works:**
- A "day" counts if at least 1 meal was detected AND the user opened the app
- Streak resets at midnight if previous day had no activity
- Grace period: 1 "freeze" per week (auto-applied, or manual)

**Visual Representation:**
```
🔥 12 ימים ברצף

[●][●][●][●][●][●][●]  ← current week (filled = active)
[●][●][●][●][●][○][○]  ← previous week

Best streak: 🔥 23 ימים
```

**Streak Milestones:**
| Days | Reward | Visual |
|------|--------|--------|
| 3 | +50 XP, coach message | 🔥 |
| 7 | +100 XP, "שבוע ראשון" badge | 🔥🔥 |
| 14 | +200 XP, "על אש" badge | 🔥🔥🔥 |
| 30 | +500 XP, "חודש מלא" badge | 🔥🔥🔥🔥 |
| 50 | +750 XP, exclusive frame | 🔥🔥🔥🔥🔥 |
| 100 | +1500 XP, "יהלום" badge, legendary effect | 💎🔥 |

**Streak Freeze:**
- 1 free freeze per week
- Additional freezes: cost 50 XP each (max 2 per week)
- Freeze icon: ❄️ shown on frozen day in calendar
- Coach message when freeze is used: "החלטה חכמה לשמור על הסטריק! מחר חוזרים 💪"

---

## 4. AI Coach Personality (אישיות המאמן)

### 4.1 Coach Identity

- **Name:** גל (Gal) — unisex Hebrew name, means "wave" (like waves of energy)
- **Personality:** Gym buddy energy. Motivating, slightly funny, always supportive. Uses slang naturally. Never guilt-trips. Celebrates small wins. Knows when to push and when to ease off.
- **Avatar:** Stylized character with a headband and smile. Animated idle state (breathing, occasional wink). Changes expression based on context (excited, thinking, cheering).
- **Speech style:** Short sentences. Emoji usage (moderate). Mix of encouragement and practical advice. Addresses user by first name.

### 4.2 Message Categories & Examples

#### A. Healthy Meal Detected (ארוחה בריאה)

1. "אוו, [name]! שקשוקה? יופי של בחירה. חלבון על הבוקר = מלך 👑"
2. "סלט עם חזה עוף? את/ה ברצח היום. +5 XP 💚"
3. "ירקות מאודים? מישהו לקח את הבריאות ברצינות! כל הכבוד 🥦"
4. "אוכל ביתי! אין כמו. הגוף שלך אומר תודה 🏠"
5. "פרוטאין בכל ארוחה — את/ה יודע/ת מה את/ה עושה 💪"

#### B. Junk Food / Unhealthy Meal (אוכל לא בריא)

6. "פיצה? מבין אותך, גם אני לא יכול לעמוד בפני. תהנה, נפצה על זה אחר כך 🍕"
7. "המבורגר — קלאסיקה. לא אשפוט, רק אזכיר שהליכה של 30 דק' תעשה פלאים 😉"
8. "נראה שהיום יום חופשי מדיאטה, וזה לגמרי בסדר! מחר חוזרים לעניינים 💪"
9. "שוקולד! לפעמים הנשמה צריכה. אם זה מריגע אותך, שווה את זה 🍫"
10. "אהה, ארוחה עשירה! בואו נשמור על האנרגיה — אולי הליכה קטנה בהמשך?"

#### C. Haven't Eaten in 4+ Hours (לא אכלת מזמן)

11. "היי [name], כבר 4 שעות בלי אוכל. הכל בסדר? הגוף צריך דלק ⛽"
12. "אוקיי, השעה עוברת ולא ראיתי שום אוכל... לא לשכוח לאכול! 🕐"
13. "פרו טיפ: לא לאכול מוריד את חילוף החומרים. תאכל/י משהו קטן לפחות 🥜"

#### D. Close to Daily Calorie Goal (קרוב ליעד)

14. "נשאר לך עוד 200 קק"ל ליעד! ארוחת ערב קלה ואת/ה שם 🎯"
15. "כמעט! 150 קק"ל ואתה פוגע ביעד. יוגורט + פירות? מושלם 🎯"
16. "את/ה ממש קרוב ליעד היום. בואו נסגור את היום בסטייל!"

#### E. Exceeded Calorie Goal (חריגה מהיעד)

17. "עברת קצת מהיעד — אבל יום אחד לא הורס כלום. מחר יום חדש! 🌅"
18. "100 קלוריות מעל? בכלל לא דרמה. הליכה של 20 דק' מפצה על זה 🚶"
19. "קצת מעל, אבל בסה\"כ יום סביר. אל תהיה קשה עם עצמך 💚"

#### F. Streak Milestone (אבן דרך בסטריק)

20. "🔥 3 ימים ברצף! זה כבר הרגל! +50 XP"
21. "שבוע שלם! 7 ימים ברצף — אתה חיה! 🔥🔥 +100 XP"
22. "14 ימים?! את/ה לא עוצר/ת! 'על אש' badge unlocked! 🏆"
23. "חודש! 30 ימים! אני מתרגש יותר ממך כנראה 😂🔥🔥🔥🔥"

#### G. Level Up (עלייה ברמה)

24. "🎉 LEVEL UP! ברוכים הבאים לרמה 4 — 'שף טירון'! הדרך ארוכה אבל אתה רוכב!"
25. "רמה 6! 'מאזן מאסטר' — השם הזה מתאים לך. באמת 💪"
26. "אגדת קאלאיי! רמה 10! אני... אני צריך רגע. מרגש. 🥲👑"

#### H. Morning Greeting (ברכת בוקר)

27. "בוקר טוב [name]! 🌞 יום חדש, הזדמנות חדשה. מה נאכל היום?"
28. "בוקר! המצלמה ערה ומוכנה. מתחילים עם ארוחת בוקר?"
29. "שבת שלום [name]! גם בשבת אני פה. תהנה ותאכל לנשמה 😎"

#### I. Evening Summary (סיכום ערב)

30. "יום מעולה [name]! אכלת מאוזן, הגעת ליעד, ואפילו אימון — מה עוד צריך? 🌙"
31. "סיכום: 1,850 קק"ל, מאקרו מאוזן. יום של אלופים. לילה טוב! 😴"
32. "לא היום הכי טוב, אבל גם ימים כאלה חשובים. מנוחה טובה, מחר נגרוס 💚"

#### J. Workout Suggestion After Heavy Meal (המלצת אימון)

33. "ארוחה רצינית! 💪 מה דעתך על ריצה קלה של 30 דק' בעוד שעה?"
34. "800 קלוריות? רספקט. אבל בוא נשרוף קצת — אימון כוח 20 דק'?"
35. "ארוחה כבדה = אנרגיה. בוא ננצל את זה! הליכה מהירה 30 דק' בעוד שעתיים?"

#### K. Balanced Macros Compliment (מחמאה על מאקרו מאוזן)

36. "וואו, המאקרו שלך היום מושלם! חלבון, פחמימות, שומן — כמו מדריך תזונה 📊"
37. "איזון מושלם! הגוף שלך מקבל בדיוק מה שהוא צריך. גאה בך! ⚖️"

#### L. Late Night Eating (אכילה מאוחרת)

38. "אכילת לילה? קורה. רק תנסה/י משהו קל — הגוף צריך לנוח בלילה 🌙"
39. "23:30 וארוחה? לא סוף העולם. אבל מחר ננסה לסיים לפני 21:00?"
40. "חטיף לילי! אם זה מתוך רעב אמיתי — בסדר גמור. אם מתוך שעמום... אולי כוס תה? 🍵"

#### M. Skipped Breakfast (דילגת על ארוחת בוקר)

41. "כבר 10:00 ולא ראיתי ארוחת בוקר... יש צום מרענן אבל יש גם פשוט שכחת 😅"
42. "ארוחת בוקר = דלק ליום. עדיין לא מאוחר — תפוס/י משהו! 🍌"

---

## 5. Workout Suggestions Logic (לוגיקת המלצות אימון)

### 5.1 Calorie-Based Mapping

| Calories Consumed | Suggested Workouts | Duration | Wait Time |
|-------------------|--------------------|----------|-----------|
| 0–300 (Light) | הליכה קלה / מתיחות | 15 דק' | 30 min |
| 301–600 (Medium) | הליכה מהירה / יוגה / רכיבה | 20–30 דק' | 45 min |
| 601–1000 (Heavy) | ריצה / אימון כוח / שחייה | 25–30 דק' | 60 min |
| 1000+ (Very Heavy) | ריצה ארוכה / HIIT / אימון משולב | 30–45 דק' | 90 min |

### 5.2 Macro-Based Adjustments

| Dominant Macro | Adjustment | Reasoning |
|----------------|------------|-----------|
| High Carbs (>50% of meal) | Prefer cardio (running, cycling, swimming) | Carbs = quick energy → cardio burns glycogen |
| High Protein (>35% of meal) | Prefer strength (weights, bodyweight, resistance) | Protein = muscle fuel → capitalize on it |
| High Fat (>40% of meal) | Prefer low-intensity (walking, yoga, stretching) | Fat digests slow → avoid intense exercise |
| Balanced | Any workout, user's choice | Offer 2-3 options |

### 5.3 Time-Based Adjustments

| Time of Day | Adjustment |
|-------------|------------|
| Morning (6–10 AM) | Full range of suggestions |
| Midday (10 AM–2 PM) | Prefer shorter sessions (office-friendly: walk, stretching) |
| Afternoon (2–6 PM) | Full range |
| Evening (6–9 PM) | Prefer moderate (no HIIT — sleep disruption) |
| Night (9 PM+) | Only stretching/yoga or "walk tomorrow morning" |

### 5.4 Smart Timing Rules

1. **Never suggest workout immediately after eating** — minimum wait time per table above
2. **Don't spam:** Max 2 workout suggestions per day
3. **Don't suggest during sleep hours** (22:00–07:00)
4. **If user confirmed workout today:** Don't suggest another unless they ate 800+ cal since
5. **Weekend adjustment:** Suggest longer, leisure activities (hike, swim) over gym
6. **Weather awareness (future feature):** Prefer indoor when raining

### 5.5 Suggestion Format

```
┌──────────────────────────────────────┐
│  🏋️ המלצת אימון                    │
│                                      │
│  בעקבות ארוחה של 650 קק"ל          │
│  (רוב פחמימות)                       │
│                                      │
│  🏃 ריצה — 30 דק'                   │
│  🔥 ~280 קק"ל ישרפו                │
│  ⏰ מומלץ בעוד שעה                  │
│                                      │
│  [עשיתי!✅]   [אח"כ⏰]   [דלג❌]   │
└──────────────────────────────────────┘
```

---

## 6. Smart Nudges System (מערכת דחיפות חכמות)

### 6.1 Nudge Types & Triggers

| Trigger | Timing | Nudge Type | Content | Priority |
|---------|--------|------------|---------|----------|
| Food detected | Immediate | Toast (top-right) | Food name + calories + macros | High |
| Post-meal workout | 30–90 min after meal | Bottom sheet | Workout suggestion card | Medium |
| No eating 4h+ | After 4h gap | Coach bubble | "הכל בסדר? לא אכלת כבר 4 שעות" | Low |
| Late night eating (22:00+) | Immediate | Gentle toast | "אוכל מאוחר? לא נורא, תנסה משהו קל" | Low |
| Daily goal reached | When total hits target ±50 | Celebration overlay | Confetti + XP + coach message | High |
| Daily goal exceeded | When total > target + 200 | Subtle coach bubble | Encouraging, never shaming | Low |
| Level up | On XP threshold | Full-screen overlay | Level name + reward + confetti | Highest |
| Streak milestone | On streak day count | Full-screen overlay | Badge + XP + fire animation | Highest |
| Badge unlocked | On condition met | Slide-in card | Badge icon + name + description | High |
| Morning greeting | First open of day (after 6 AM) | Coach bubble | Personalized greeting | Low |
| Evening summary | 22:00 (configurable) | Full-screen card | Day recap (see section 1.5) | Medium |
| Webcam issue | On camera loss | Status bar warning | "המצלמה לא פעילה — בדוק חיבור" | High |
| Weekly report | Sunday 10:00 | Push notification | Week summary + trend | Medium |

### 6.2 Nudge Behavior Rules

1. **Max 3 nudges per hour** — prevent notification fatigue
2. **High priority overrides low** — if level up + food detected at same time, show level up first
3. **Queue system:** nudges queue and show one at a time with 3s gap
4. **Dismissable:** all nudges can be swiped away
5. **Do Not Disturb:** user can set quiet hours (no nudges, only logging)
6. **Sound:** subtle "ding" for food detection, special sound for level-up/badge
7. **Haptic (mobile):** light vibration for food detection, strong for achievements

### 6.3 Nudge Visual Hierarchy

```
Priority HIGHEST: Full-screen overlay (level up, streak milestone)
    ↓
Priority HIGH: Toast notification (food detected, badge)
    ↓
Priority MEDIUM: Bottom sheet / card (workout, weekly report)
    ↓
Priority LOW: Coach bubble (reminders, greetings)
    ↓
Priority INFO: Status bar indicator (webcam status, sync)
```

---

## 7. Data Display Specs (תצוגת נתונים)

### 7.1 Hourly Calorie Chart

**Type:** Vertical bar chart (horizontal scroll on mobile)
**X-axis:** Hours 6:00–23:00 (configurable wake/sleep)
**Y-axis:** Calories (0–max detected, auto-scale)

**Bar Color Coding:**
| Calories | Color | Hex | Label |
|----------|-------|-----|-------|
| 0–300 | Green | #22c55e | ארוחה קלה |
| 301–600 | Yellow/Amber | #f59e0b | ארוחה בינונית |
| 601+ | Orange/Red | #ef4444 | ארוחה כבדה |

**Bar Behavior:**
- Bars have rounded top corners (border-radius: 4px)
- Hover/tap shows tooltip: time, food name, exact calories
- Current hour has a subtle pulse/glow
- Future hours show as dashed outlines
- Animate bars growing from 0 on first load (staggered, 100ms delay between bars)

**Chart Layout:**
```
קק"ל
600 ┤
    │
400 ┤              ▓▓
    │     ▓▓       ▓▓       ▓▓
200 ┤     ▓▓  ▓▓   ▓▓       ▓▓
    │ ▓▓  ▓▓  ▓▓   ▓▓  ▓▓   ▓▓
  0 ┼──┬──┬──┬──┬──┬──┬──┬──┬──
     7  8  9 10 11 12 13 14 15 ... שעה
```

### 7.2 Food Log

**Layout:** Vertical scrollable list (newest first)

**Each Entry:**
```
┌─────────────────────────────────────────────────┐
│  ┌──────┐                                       │
│  │      │  12:30 — פיצה מרגריטה                 │
│  │ IMG  │  285 קק"ל                             │
│  │64×64 │  ח: 12g  |  פ: 10g  |  ש: 36g        │
│  │      │  ביטחון: 87% [✏️ תקן]                 │
│  └──────┘                                       │
│  ──────────────────────────────────────────────  │
│  ┌──────┐                                       │
│  │      │  09:15 — ביצים + לחם מחיטה מלאה       │
│  │ IMG  │  320 קק"ל                             │
│  │64×64 │  ח: 22g  |  פ: 8g  |  ש: 28g         │
│  │      │  ביטחון: 92%                           │
│  └──────┘                                       │
└─────────────────────────────────────────────────┘
```

**Entry Components:**
| Element | Spec |
|---------|------|
| Thumbnail | 64×64px, rounded corners (8px), webcam capture |
| Timestamp | HH:MM format, right-aligned (RTL) |
| Food name | Hebrew, bold, max 2 lines with ellipsis |
| Calories | Large font (18px), primary color |
| Macros | Icons: ח (חלבון/protein), פ (פחמימות/carbs), ש (שומן/fat) |
| Confidence | Percentage with color: green >85%, yellow 70-85%, red <70% |
| Edit button | ✏️ icon, opens manual correction modal |

**Tap to Expand:**
- Full-size captured image
- Detailed macro breakdown with mini bar chart
- AI reasoning: "זיהיתי פיצה מרגריטה לפי: גבינה מותכת, רוטב עגבניות, בצק עגול"
- "דווח כשגוי" link

### 7.3 Daily Summary Card

**Layout:** Prominent card at top of dashboard

```
┌──────────────────────────────────────────────┐
│                                              │
│   ╭────────────╮    ╭──────────────────╮     │
│   │            │    │                  │     │
│   │   1,847    │    │    ◯◯◯ RING     │     │
│   │   קק"ל    │    │   ◯     ◯       │     │
│   │            │    │   ◯  P  ◯       │     │
│   │ מתוך 2,000│    │   ◯ 21% ◯       │     │
│   │            │    │   ◯     ◯       │     │
│   ╰────────────╯    │    ◯◯◯          │     │
│                     │  C:46%  F:33%   │     │
│                     ╰──────────────────╯     │
│                                              │
│   ⭐ +45 XP היום    🔥 12 ימים ברצף         │
│   ████████████░░░░ Level 4 (72%)             │
│                                              │
└──────────────────────────────────────────────┘
```

**Components:**
| Element | Spec |
|---------|------|
| Total Calories | Animated counting number, 32px bold, primary color |
| Goal | Smaller text below: "מתוך X,XXX" |
| Macro Ring | Three-segment donut chart (protein=blue, carbs=green, fat=yellow) |
| Macro Labels | Percentage + grams for each macro |
| XP Today | Star icon + animated counter |
| Streak | Fire emoji + day count |
| Level Progress | Progress bar with percentage, level name |

**Macro Ring Colors:**
- Protein: #3b82f6 (blue)
- Carbs: #22c55e (green)
- Fat: #f59e0b (amber)

### 7.4 Weekly Trend View (accessible from dashboard)

```
┌──────────────────────────────────────────┐
│  📊 מגמה שבועית                         │
│                                          │
│  2100 ┤                                  │
│  2000 ┤─ ─ ─ ─ יעד ─ ─ ─ ─ ─ ─ ─       │
│  1900 ┤      ╱╲                          │
│  1800 ┤    ╱    ╲    ╱╲                  │
│  1700 ┤  ╱        ╲╱    ╲               │
│  1600 ┤╱                   ╲             │
│       ┼──┬──┬──┬──┬──┬──┬──             │
│        א  ב  ג  ד  ה  ו  ש             │
│                                          │
│  ממוצע: 1,823 קק"ל | מגמה: ↘ -3%       │
└──────────────────────────────────────────┘
```

---

## 8. Color & Visual Specs (צבעים ועיצוב)

### 8.1 Color Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Background | Deep Black | `#0a0a0f` | Page background |
| Surface | Dark Navy | `#1a1a2e` | Cards, panels |
| Surface Hover | Lighter Navy | `#252542` | Hover states |
| Surface Border | Glass Border | `rgba(255,255,255,0.08)` | Card borders (glassmorphism) |
| Primary | Health Green | `#00d4aa` | Main accent, CTAs, active states |
| Primary Hover | Bright Green | `#00eebb` | Hover on primary elements |
| Primary Muted | Dark Green | `rgba(0,212,170,0.15)` | Backgrounds, tags |
| Secondary | XP Gold | `#f59e0b` | XP, gamification, achievements |
| Secondary Hover | Bright Gold | `#fbbf24` | Hover on secondary elements |
| Error / Warning | Red | `#ef4444` | Over limit, errors |
| Success | Green | `#22c55e` | Under limit, positive |
| Purple Accent | Violet | `#7c3aed` | Level-up, special events |
| Text Primary | White | `#f1f5f9` | Main text |
| Text Secondary | Gray | `#94a3b8` | Subtitles, captions |
| Text Tertiary | Dark Gray | `#64748b` | Disabled, hints |

### 8.2 Glassmorphism Spec

All cards use a glassmorphism effect:

```css
.card {
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 8.3 Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| H1 (page title) | Heebo | 700 | 28px | 1.3 |
| H2 (section title) | Heebo | 600 | 22px | 1.3 |
| H3 (card title) | Heebo | 600 | 18px | 1.4 |
| Body | Heebo | 400 | 15px | 1.6 |
| Body Small | Heebo | 400 | 13px | 1.5 |
| Caption | Heebo | 300 | 11px | 1.4 |
| XP / Numbers | Heebo | 700 | varies | 1.1 |
| Coach Message | Heebo | 400 | 15px | 1.6 |

**Font Loading:**
```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap" rel="stylesheet">
```

**RTL Configuration:**
```css
html {
  direction: rtl;
  font-family: 'Heebo', sans-serif;
}
```

### 8.4 Spacing System

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps (icon to text) |
| sm | 8px | Inline spacing |
| md | 16px | Card padding |
| lg | 24px | Section gaps |
| xl | 32px | Major section separation |
| 2xl | 48px | Page margins |

### 8.5 Border Radius

| Element | Radius |
|---------|--------|
| Cards | 16px |
| Buttons (large) | 12px |
| Buttons (small) | 8px |
| Thumbnails | 8px |
| Input fields | 8px |
| Badges | 50% (circle) |
| Webcam PiP (mobile) | 50% (circle) |
| Webcam PiP (desktop) | 12px |
| Chart bars | 4px (top only) |

### 8.6 Elevation / Shadow Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Flat elements |
| 1 | `0 2px 8px rgba(0,0,0,0.2)` | Cards |
| 2 | `0 8px 32px rgba(0,0,0,0.3)` | Elevated cards, modals |
| 3 | `0 16px 48px rgba(0,0,0,0.4)` | Full-screen overlays |
| Glow | `0 0 20px rgba(0,212,170,0.3)` | Active/highlighted elements |

---

## 9. Animation Specs (אנימציות)

### 9.1 Food Detection Toast

```
Animation: slideInFromTopRight
Duration: 400ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1) (overshoot)
Stay: 5000ms
Exit: fadeSlideUp, 300ms

Keyframes:
  0%:   translateX(100%) translateY(-20px), opacity: 0
  100%: translateX(0) translateY(0), opacity: 1
```

### 9.2 XP Gain Animation

```
Animation: floatingXP
Duration: 1500ms
Easing: ease-out

Keyframes:
  0%:   translateY(0), opacity: 1, scale(1)
  50%:  translateY(-30px), opacity: 1, scale(1.2)
  100%: translateY(-60px), opacity: 0, scale(0.8)

Text: "+5 XP" in gold (#f59e0b), bold, 16px
Position: appears above the element that triggered XP
```

### 9.3 Level Up Celebration

```
Phase 1 — Backdrop (200ms)
  Full-screen overlay, background: rgba(0,0,0,0.8)
  Fade in

Phase 2 — Confetti (starts at 200ms, lasts 3000ms)
  150 particles, colors: primary palette
  Physics: gravity + slight wind
  Library recommendation: canvas-confetti

Phase 3 — Banner (starts at 400ms)
  Animation: scaleIn
  Duration: 600ms
  Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
  Keyframes:
    0%:   scale(0), opacity: 0
    60%:  scale(1.1), opacity: 1
    100%: scale(1), opacity: 1

  Content:
    "🎉 LEVEL UP!"
    "Level X: [name]"
    XP bar animation filling to new level

Phase 4 — Dismiss (after 4s or tap)
  Fade out all, 300ms
```

### 9.4 Calorie Counter Animation

```
Animation: countUp
Duration: 1000ms per update
Easing: ease-out
Method: requestAnimationFrame, interpolate from old value to new value
Format: toLocaleString('he-IL') for thousands separator
Decimal: none (whole numbers only)

Example: 1,247 → 1,532 over 1 second
```

### 9.5 Chart Bars Grow

```
Animation: barGrow
Duration: 600ms per bar
Stagger: 80ms between bars (left to right)
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
Trigger: on viewport enter (IntersectionObserver)

Keyframes:
  0%:   height: 0, opacity: 0
  100%: height: [target], opacity: 1
```

### 9.6 Streak Fire Pulse

```
Animation: firePulse
Duration: 2000ms
Iteration: infinite
Easing: ease-in-out

Keyframes:
  0%:   scale(1), filter: brightness(1)
  50%:  scale(1.15), filter: brightness(1.3)
  100%: scale(1), filter: brightness(1)

Applied to: 🔥 emoji in streak counter
```

### 9.7 Badge Unlock

```
Phase 1 — Spin In (600ms)
  Keyframes:
    0%:   scale(0), rotate(180deg), opacity: 0
    60%:  scale(1.2), rotate(-10deg), opacity: 1
    100%: scale(1), rotate(0deg), opacity: 1

Phase 2 — Glow Pulse (starts at 600ms, loops 3 times)
  Duration: 800ms per loop
  Keyframes:
    0%:   box-shadow: 0 0 0px rgba(245,158,11,0)
    50%:  box-shadow: 0 0 30px rgba(245,158,11,0.6)
    100%: box-shadow: 0 0 0px rgba(245,158,11,0)

Phase 3 — Settle (after glow loops)
  Subtle float animation (translateY ±3px, infinite)
```

### 9.8 Coach Message Bubble

```
Animation: bubbleIn
Duration: 400ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

Keyframes:
  0%:   scale(0), transformOrigin: bottom-right (RTL: bottom-left)
  100%: scale(1)

Text appears with typewriter effect:
  Duration: 30ms per character
  Cursor: blinking | at end, disappears after 1s
```

### 9.9 Macro Ring Chart

```
Animation: ringDraw
Duration: 1200ms
Easing: ease-out
Method: SVG stroke-dashoffset animation

Each segment draws sequentially:
  Protein ring: 0–400ms
  Carbs ring: 200–800ms
  Fat ring: 400–1200ms

Starting angle: 12 o'clock (top)
Direction: clockwise
```

### 9.10 Page Transitions

```
Between views/tabs:
  Animation: fadeSlide
  Duration: 250ms
  Easing: ease-out

  Exit:  translateX(-20px), opacity → 0
  Enter: translateX(20px), opacity 0 → 1
  (Reversed for RTL: positive = exit right, negative = enter left)
```

---

## 10. Edge Cases & Smart Behavior (מקרי קצה)

### 10.1 Food Visible But Not Being Eaten

**Problem:** Webcam sees food on desk/table but user isn't eating.

**Solution: Multi-Signal Confidence System**
```
Signal 1: Food detected in frame (Gemini Vision)     → +40% base confidence
Signal 2: Hand/utensil near food                      → +20%
Signal 3: Mouth movement / chewing motion detected    → +20%
Signal 4: Food quantity decreasing over time           → +15%
Signal 5: Mealtime context (11:30-13:30, 18:00-20:30) → +5%

Threshold for logging: 70% combined confidence
```

**Behavior:**
- Below 70%: Don't log, no notification
- 70-85%: Log with "ביטחון בינוני" tag, show confirmation toast: "נראה שאתה אוכל [food]? [✅ כן] [❌ לא]"
- Above 85%: Auto-log, show info toast (still editable)

### 10.2 Duplicate Detection (Same Food)

**Problem:** Same plate detected multiple times as user continues eating.

**Solution: 5-Minute Dedup Window**
```
IF new_detection.food_name ≈ recent_detection.food_name (fuzzy match)
AND time_delta < 5 minutes
THEN:
  - Don't create new entry
  - If new confidence > old confidence: update entry
  - If food quantity appears larger: increase calorie estimate by 10-20%
  - Log as "עדכון" (update) not new entry
```

**Extended meal handling:**
- If eating continues past 15 minutes: show subtle note "ארוחה ארוכה — נראה שאתה עדיין אוכל"
- If same food reappears after 5+ minute gap: treat as second portion, new entry

### 10.3 Webcam Covered / Dark

**Problem:** Camera feed is black, covered, or very dark.

**Solution:**
```
Detection: average pixel brightness < 15 (on 0-255 scale) for 10+ seconds

Actions:
  1. Status indicator changes: 👁️ → ⚠️
  2. PiP border turns red
  3. After 30s: coach bubble "המצלמה חשוכה — אולי היא מכוסה? 🔍"
  4. After 2 min: status bar warning "⚠️ המצלמה לא פעילה — לא ניתן לזהות אוכל"
  5. Continue trying every 10s
  6. When restored: green flash + "המצלמה חזרה! 👁️✅"
```

**Low-light (not fully dark):**
- Brightness 15-50: show "תאורה חלשה — הזיהוי עלול להיות פחות מדויק"
- Adjust confidence threshold down by 10% (be more lenient)

### 10.4 Video Call Detection

**Problem:** User is on a video call — camera shows their face + screen, not food.

**Solution:**
```
Detection signals:
  1. Face centered in frame for extended period (>2 min)
  2. Screen/monitor glare in background
  3. No food elements detected despite face being visible
  4. Typical video call framing (head + shoulders)

Behavior:
  - Reduce analysis frequency: every 2s → every 10s
  - Increase confidence threshold: 70% → 85%
  - Show status: "📹 נראה שאתה בשיחת וידאו — מנטר ברקע"
  - If food IS detected during call (user eating on camera): still log, but verify
  - When call ends (face leaves frame or framing changes): resume normal frequency
```

### 10.5 Multiple Foods in One Frame

**Problem:** Plate with several distinct foods, or multiple dishes on table.

**Solution:**
```
Strategy 1: Itemized Detection
  - Gemini Vision identifies each food item separately
  - Log as single meal entry with sub-items:
    "ארוחת צהריים — 3 פריטים"
    ├── חזה עוף (150g) — 248 קק"ל
    ├── אורז (100g) — 130 קק"ל
    └── סלט ירקות — 45 קק"ל
    סה"כ: 423 קק"ל

Strategy 2: Composite Detection (fallback)
  - If items are mixed/unclear: estimate as single dish
  - "ארוחה מעורבת — ~400 קק"ל"
  - Show "✏️ פרט" button for user to itemize manually
```

### 10.6 Unknown / Unrecognizable Food

**Problem:** AI can't identify the food with sufficient confidence.

**Solution:**
```
IF food_detected = true AND identification_confidence < 50%
THEN:
  Show interactive toast:
  ┌──────────────────────────────────────┐
  │  🤔 מזון לא מזוהה                   │
  │  "ראיתי שאכלת משהו אבל לא בטוח מה" │
  │                                      │
  │  [סמן ידנית ✏️]   [התעלם ❌]        │
  └──────────────────────────────────────┘

Manual marking flow:
  1. Show captured thumbnail
  2. Text input: "מה אכלת?"
  3. Auto-suggest from food database as user types
  4. If selected from DB: auto-fill calories + macros
  5. If custom text: ask for estimated calories
  6. Log with "ידני" tag
  7. Award +2 XP for helping AI learn
```

### 10.7 Same Food Different Portion Sizes

**Problem:** AI sees "rice" but can't tell if it's 100g or 300g.

**Solution:**
```
Default: estimate medium portion for the food type
Show in entry: "~130 קק"ל (מנה בינונית)"

Post-detection nudge (if confidence < 80%):
  "כמה אורז היה? [מנה קטנה 🥄] [בינונית 🍚] [גדולה 🍛]"

User selection updates the calorie estimate immediately.
Over time, AI learns user's typical portion sizes from corrections.
```

### 10.8 Browser Tab Not Focused / Minimized

**Problem:** User switches to another tab or minimizes browser.

**Solution:**
```
Behavior:
  - Camera continues running (if permission allows) via Web Worker
  - Analysis continues at reduced frequency (every 5s instead of 2s)
  - Food detections are queued
  - When user returns: show summary "בזמן שהיית בטאב אחר, זיהיתי: ..."
  - If browser fully minimizes: camera may pause (browser API limitation)
    → Show notification on return: "המצלמה הייתה כבויה — רוצה להפעיל?"

Tab indicator:
  - Document title changes: "CalEye 👁️" → "CalEye ⏸️ (ברקע)"
  - Favicon changes to indicate background status
```

### 10.9 Multiple People in Frame

**Problem:** Other people eating near the user.

**Solution:**
```
Strategy: Focus Zone
  - During onboarding, calibrate "user zone" (center of webcam, closest face)
  - Only analyze food near the primary user's hands/face
  - Ignore food items in the background or near other faces
  - If uncertain: "זיהיתי כמה אנשים אוכלים — איזו ארוחה שלך?"
    with thumbnail crops to choose from
```

### 10.10 Rapid Food Changes (Buffet / Multi-Course)

**Problem:** User eating multiple courses at a restaurant or buffet.

**Solution:**
```
Detection: Multiple different foods within 20-minute window

Behavior:
  - Group as "ארוחה מרובת מנות" (multi-course meal)
  - Log each course as sub-entry
  - Show running total: "ארוחה בעיצומה... 450 קק"ל עד כה"
  - Final summary when no new food detected for 10 min:
    "ארוחה הסתיימה! סה"כ: 780 קק"ל, 4 מנות"
  - Don't send workout suggestion until meal is "closed"
```

### 10.11 Network/API Failures

**Problem:** Gemini API is unreachable or slow.

**Solution:**
```
Retry policy:
  - 3 retries with exponential backoff (1s, 3s, 9s)
  - During retry: show "⏳ מעבד..." on PiP
  - If all fail: queue frame for later analysis
  - Show subtle status: "📡 חיבור איטי — הזיהוי עלול להתעכב"
  - When reconnected: process queued frames
  - If offline for 5+ min: "אין חיבור — הזיהוי מושהה. הנתונים ישלחו כשהחיבור יחזור"

Graceful degradation:
  - Dashboard still shows historical data
  - User can manually log food
  - Coach messages from cache
```

### 10.12 Privacy & Data Handling

```
Core principles:
  1. Webcam frames analyzed in real-time, NOT stored as video
  2. Only food-frame thumbnails saved (cropped, not full webcam)
  3. Face data NEVER stored — only used for live detection
  4. All data stored locally (IndexedDB) by default
  5. Optional cloud sync (encrypted, user opt-in)
  6. "Delete all data" button in settings (immediate, no 30-day wait)
  7. Camera indicator: always visible green dot when active
  8. One-tap camera kill: immediately stops all webcam access
```

---

## Appendix A: Technical Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│  │ Webcam   │  │ Gemini   │  │ Dashboard │             │
│  │ Stream   │→ │ Vision   │→ │ State     │             │
│  │ Manager  │  │ Analyzer │  │ (Zustand) │             │
│  └──────────┘  └──────────┘  └───────────┘             │
│       ↑              ↑              ↓                    │
│  getUserMedia   API calls     React components           │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │            IndexedDB (Local)              │           │
│  │  - Food log entries                       │           │
│  │  - Daily summaries                        │           │
│  │  - Thumbnails (base64)                    │           │
│  │  - User profile + goals                   │           │
│  │  - XP, level, streak, badges              │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│  │ Gamify   │  │ Coach    │  │ Workout   │             │
│  │ Engine   │  │ Engine   │  │ Recommender│             │
│  │ (XP/Lvl) │  │ (NLG)   │  │           │             │
│  └──────────┘  └──────────┘  └───────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
        ↕ (API)
┌─────────────────────┐
│   Gemini Vision API  │
│   (Google Cloud)     │
└─────────────────────┘
```

**Recommended Stack:**
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| State | Zustand (lightweight, no boilerplate) |
| UI | Tailwind CSS + custom components |
| Charts | Recharts or Chart.js |
| Animations | Framer Motion |
| Camera | navigator.mediaDevices.getUserMedia() |
| AI | Gemini 2.0 Flash Vision API |
| Storage | IndexedDB (via Dexie.js) |
| PWA | Service Worker for offline support |
| Confetti | canvas-confetti |
| Font | Google Fonts: Heebo |

---

## Appendix B: Gemini Vision Prompt Template

```
System prompt for food analysis:

"You are a food identification AI for a Hebrew calorie tracking app.
Analyze the webcam frame and respond in JSON format.

Detect:
1. Is there food in the frame? (boolean)
2. Is someone eating? (confidence 0-100)
3. For each food item:
   - name_he: Food name in Hebrew
   - name_en: Food name in English
   - calories: Estimated calories (kcal)
   - protein_g: Protein in grams
   - carbs_g: Carbohydrates in grams
   - fat_g: Fat in grams
   - portion_size: "small" | "medium" | "large"
   - confidence: 0-100

Response format:
{
  "food_detected": true,
  "eating_confidence": 87,
  "items": [
    {
      "name_he": "פיצה מרגריטה",
      "name_en": "Margherita Pizza",
      "calories": 285,
      "protein_g": 12,
      "carbs_g": 36,
      "fat_g": 10,
      "portion_size": "medium",
      "confidence": 87
    }
  ]
}

Be accurate with Israeli foods: שקשוקה, חומוס, פלאפל, שווארמה, etc.
If unsure, estimate conservatively and indicate lower confidence."
```

---

## Appendix C: Design Inspiration Sources

This spec was informed by research into current gamified health app trends:

- **Duolingo patterns:** Streaks as core retention mechanic, variable rewards (XP + badges + levels), celebration animations for milestones, friendly mascot/coach personality
- **Health app gamification (2025-2026):** Headspace (progress + badges + streaks for mindfulness), Lifesum (nutrition tracking with progress bars and milestone badges), MySugr (gamified representation of health management), Mango Health (points redeemable for rewards)
- **Key insight:** Gamified health apps show up to 50% higher user retention (Deloitte research). The most effective approach combines intrinsic motivation (health improvement) with extrinsic rewards (XP, badges, levels)
- **Dashboard trends (2026):** Soft color palettes with glowing accents, glassmorphism cards, AI-powered insights, clean data visualization that feels intelligent and intuitive
- **References:**
  - [Health Gamification Examples — Trophy](https://trophy.so/blog/health-gamification-examples)
  - [Top 10 Gamification in Fitness Apps — Yu-kai Chou](https://yukaichou.com/gamification-analysis/top-10-gamification-in-fitness/)
  - [Duolingo Gamification Case Study — Raw.Studio](https://raw.studio/blog/how-duolingo-utilises-gamification/)
  - [Dashboard Design Examples 2026 — Muzli](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/)
  - [Gamification in Healthcare 2026 — OpenLoyalty](https://www.openloyalty.io/insider/gamification-healthcare)

---

*End of CalEye App Design Specification v1.0*
