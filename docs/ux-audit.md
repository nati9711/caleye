# CalEye UX Audit

**Date:** 2026-03-24
**Auditor:** Claude Opus 4.6
**Scope:** 3-round feature audit (Functional, Adversarial, UX)
**Files analyzed:** 22 source files across hooks, lib, components, store, types, constants

---

## Critical (Must Fix)

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| C1 | **USDA API key hardcoded in source** | `src/lib/nutrition.ts:9` — `const USDA_API_KEY = 'SpHZ0B...'` is committed in plain text. Anyone can extract it from the client bundle. | Move to env variable (`VITE_USDA_API_KEY`), load via `import.meta.env`, add `.env` to `.gitignore`. Alternatively proxy USDA calls through a lightweight backend. |
| C2 | **Edit button is a no-op** | `DashboardPage.tsx:456` — `onEditEntry={(entry) => console.log('Edit:', entry.id)}`. Users see an edit pencil but clicking it does nothing. The "Report as incorrect" button in `FoodLogEntry.tsx:196` is also non-functional (no onClick handler). | Implement an edit modal/bottom-sheet that allows correcting food name, calories, and macros. Wire "Report as incorrect" to the same flow or a separate correction API. |
| C3 | **No data persistence across page reloads** | `DashboardPage.tsx` uses `useState(createEmptyLog)` — the day's log is lost on refresh. The Zustand store in `stores/app-store.ts` has full persistence logic but DashboardPage does NOT use it; it manages its own parallel state. | Either migrate DashboardPage to use `useAppStore()` or add `useEffect` to save/load `todayLog` to/from localStorage on every change and on mount. |
| C4 | **AI errors are silently swallowed** | `src/lib/gemini.ts:282-284` — when `analyzeWithFetch` throws, `analyzeFrame` catches and returns `{ eating: false }` with only a `console.error`. The user sees no feedback that detection failed — it looks like "no food detected" rather than "API error". | Propagate the error to `useFoodDetection` (which already has `setError`). Change `analyzeFrame` to re-throw or return an error result type so the detection hook can differentiate "no food" from "API failure". |
| C5 | **Dual state architecture creates divergence** | DashboardPage has its own `todayLog`, `profile`, `coachMsg` state while `app-store.ts` has a fully-featured Zustand store with persistence, badge checks, streak tracking, and XP logic — none of which is actually used at runtime. | Choose one source of truth. The Zustand store is far more complete — refactor DashboardPage to consume it. |
| C6 | **API key validation is never called** | `gemini.ts` exports `testConnection()` but `ApiKeyModal` in `DashboardPage.tsx:110-189` saves the key without validating it. A wrong key means detection silently fails until the user realizes nothing is happening. | Call `testConnection(key)` before saving. Show success/error feedback in the modal. Disable the save button while testing. |
| C7 | **Webcam ref is shared but rendered twice** | DashboardPage renders `<Webcam ref={webcamRef}>` in both `mobileTopCard` (line 300) and `sidebar` (line 365). A single ref can only point to one DOM element — on desktop the mobile webcam is hidden via CSS (`md:hidden`) but still rendered, so the ref may bind to the wrong instance. | Conditionally render only one `<Webcam>` component based on screen size, or use a portal to move the same element between positions. |
| C8 | **Multiple foods detected but only one entry logged** | The AI prompt asks for a `foods[]` array. `parseDetectionResponse` in `gemini.ts:207-223` merges ALL foods into a single `DetectionResult` (concatenating names with " + ", summing grams). This means eating chicken + rice + salad = one log entry "chicken + rice + salad" with combined macros. User cannot correct individual items. | Return an array of `DetectionResult` objects. In `useFoodDetection`, create a separate `FoodEntry` for each food, or show a confirmation dialog letting the user review/split the items. |

---

## Important (Should Fix)

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| I1 | **No feedback when webcam permission is denied** | DashboardPage shows `webcamError` only as a tiny text inside the webcam box (lines 309, 374). There is no prominent banner or guidance on how to fix it. `useWebcam.retry()` just calls `window.location.reload()` — and is never exposed in the UI. | Show a prominent card with clear instructions: "Camera blocked. Click the lock icon in your browser's address bar > Allow camera." Add a "Retry" button that calls `retry()`. |
| I2 | **XP system is hardcoded at 5 XP per detection** | `useFoodDetection.ts:12` — `XP_PER_DETECTION = 5` always. The rich XP system in `lib/xp.ts` (daily caps, different actions, streak bonuses) is never called. | Use `calculateXPForAction('eating_detected', { timesUsedToday })` from `lib/xp.ts` instead of the constant. Track `timesUsedToday` to respect the cap of 6/day. |
| I3 | **Coach message logic in DashboardPage is simplistic** | `DashboardPage.tsx:220-228` — coach message is just `calories < 400 ? healthy : unhealthy`. The rich `coach.ts` module with 42 categorized messages, late-night detection, no-eating alerts, streak milestones, and personalization is never used. | Replace the inline logic with calls to `getPostMealMessage()`, `getGoalMessage()`, `isLateNightEating()`, etc. from `lib/coach.ts`. |
| I4 | **Streak never increments** | DashboardPage initializes `profile.currentStreak: 0` and never calls `updateStreak()` from `lib/xp.ts`. The streak display in Header and DailySummary will always show 0. | Call `updateStreak(profile, getTodayDate())` on first food detection of the day and update the profile accordingly. |
| I5 | **Badge system exists but is never triggered** | `constants/index.ts` defines 15 badges, `lib/xp.ts` has `checkBadgeUnlocks()`, but DashboardPage never calls it. The `LevelUpOverlay.tsx`, `BadgeShelf.tsx`, `LevelBadge.tsx` components exist but are not rendered. | Wire badge checking into the food detection flow. Show `LevelUpOverlay` on level up and `BadgeShelf` in the profile tab. |
| I6 | **Detection runs during video calls / non-food activity** | The detection loop captures a frame every 10 seconds regardless of what's on screen. If user is in a video call, the AI will analyze faces, screens, etc. — wasting API credits. | Add a "smart pause" option: detect if face is centered without food context, and skip analysis. Or add a manual "eating now" mode so detection only runs when the user initiates it. |
| I7 | **`needs_user_input` from AI is ignored** | The prompt asks the AI to set `needs_user_input: true` for packaged food and include a Hebrew question (`user_question_he`). But `parseDetectionResponse` in `gemini.ts` does not include these fields in the returned `DetectionResult` type, and `useFoodDetection` never acts on them. | Add `needsUserInput?: boolean` and `userQuestionHe?: string` to `DetectionResult`. When set, show a dialog asking the user (e.g., "How many grams does the package say?") before logging the entry. |
| I8 | **Dedup window is name-based only** | `useFoodDetection.ts:61-73` — dedup compares `normalizeFood(food)` strings. Eating "Rice" twice in 5 minutes is deduplicated, but eating different portions of the same food (refilling a plate) should be allowed. | Add an optional user override: show a "Log again?" prompt if the same food is detected within the dedup window, rather than silently dropping it. |
| I9 | **Toast auto-dismiss with no undo** | `DashboardPage.tsx:233` — toast disappears after 5 seconds. If detection was wrong, the user has no quick way to undo. | Add an "Undo" button in the toast. On click, remove the last entry from todayLog. |
| I10 | **HourlyChart ignores meals before 6:00 and after 23:00** | `DashboardPage.tsx:36` — `buildHourlyData` only creates buckets for hours 6-23. Late-night eating (00:00-05:59) is lost from the chart. | Extend to 0-23, or at minimum 5-24 (wrapping midnight). If the chart is too wide, keep 6-23 but add an "Other hours" bucket that sums 0-5 calories. |
| I11 | **Webcam facing mode change doesn't restart detection** | `DashboardPage.tsx:316` — toggling `facingMode` changes the state but the `<Webcam>` component may not seamlessly switch cameras on all devices/browsers. There's no loading state or error handling for camera switch failure. | Show a brief "Switching camera..." loading indicator. Catch errors from the camera switch and fall back to the previous camera. |
| I12 | **Hourly chart tooltip uses Arabic comma** | `HourlyChart.tsx:189` — `tooltip.foods.join('، ')` uses Arabic comma (`،` U+060C) instead of Hebrew comma or standard comma. | Use regular comma+space: `tooltip.foods.join(', ')` or Hebrew-appropriate separator. |

---

## Nice to Have

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| N1 | **No onboarding flow** | `App.tsx` renders DashboardPage directly. The constants file has `ONBOARDING` strings, `MacroPresets`, and profile setup fields, but there is no onboarding screen. User is immediately shown an empty dashboard + API key modal. | Create an OnboardingPage with steps: welcome > camera permission > API key > profile setup (name, goals, macro split) > coach intro. |
| N2 | **No history view** | `lib/storage.ts` has `archiveDailyLog`, `loadHistory`, `getHistoryLog` but no UI to browse past days. | Add a history/calendar view showing past daily logs (last 30 days). |
| N3 | **Workout tab is a placeholder** | `MainLayout.tsx:53-59` — workout tab shows "Coming soon" card. | Wire up the `WORKOUT_MAP` from constants and `WorkoutCard.tsx` component. After a heavy meal, show workout suggestions. |
| N4 | **Profile/Settings tab is a placeholder** | `MainLayout.tsx:61-68` — settings tab shows "Coming soon" card. | Create a settings page with: profile editing, calorie goal, macro split, API key management, data export, clear data. |
| N5 | **No loading skeleton** | When the page loads, all components mount simultaneously with empty data. There's no skeleton/shimmer for the initial load or while waiting for first detection. | Add skeleton components for DailySummary, HourlyChart, and FoodLog while data is loading. |
| N6 | **Base64 thumbnails stored in state** | `useFoodDetection.ts:179` — full base64 JPEG frames are stored in `FoodEntry.thumbnail`. For a day with 10 meals, this bloats memory and (if persisted) localStorage. | Resize thumbnails to 100x75 using an offscreen canvas before storing. Consider using IndexedDB for image storage instead of localStorage. |
| N7 | **Coach bubble disappears on component re-render** | `DashboardPage.tsx:199` — `coachMsg` is stored in useState. Any re-render resets it. The coach never proactively sends messages for no-eating, morning greeting, evening summary, etc. | Use a timer to trigger coach messages at appropriate times (morning, 4h no-eating, close to goal, late night). Persist the last few messages. |
| N8 | **No keyboard navigation for food log** | `FoodLogEntry.tsx` — click to expand, swipe to delete, but no keyboard support (Enter/Space to expand, Delete key to remove). | Add `onKeyDown` handlers for keyboard accessibility. |
| N9 | **Swipe-to-delete has no confirmation** | `FoodLogEntry.tsx:73-76` — swiping left beyond 80px immediately deletes. No "Are you sure?" step. | Add a brief undo toast after deletion, or require a second tap on the revealed delete button. |
| N10 | **MacroRing shows proportion, not progress toward goal** | `MacroRing.tsx` shows what % of your macros came from protein/carbs/fat, but not how close each macro is to its daily target. | Add an alternative ring mode or tooltip showing "Protein: 45g / 150g target (30%)". |
| N11 | **No dark/light mode toggle** | The app is dark-mode only. | If targeting broader audience, add a light mode option. Low priority since the current design is cohesive. |
| N12 | **`WebcamFeed.tsx` and `DetectionOverlay.tsx` are unused** | These components exist but DashboardPage renders its own inline webcam. | Either integrate these components or remove dead code to reduce bundle size and confusion. |
| N13 | **LEVELS array is duplicated** | `store/mockData.ts` has 10 levels, `lib/xp.ts` has 15 levels, `constants/index.ts` has 15 levels. DailySummary imports from `mockData.ts` — may show wrong level names. | Use a single LEVELS source (constants/index.ts). Delete duplicates. |
| N14 | **No rate-limit error differentiation** | `gemini.ts` shows generic error for 429 (rate limit) vs 401 (auth) vs 500 (server). | Parse HTTP status codes and show specific Hebrew error messages: "API rate limited, will retry in 30s", "Invalid API key", "Server error, try again". |

---

## Missing Features

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| M1 | **Manual food entry** — user types food name + weight when camera fails | High — camera isn't always practical; this is table-stakes for a food tracker | Medium (search USDA, create entry, add to log) |
| M2 | **Food correction flow** — edit detected food name, calories, macros | High — AI will be wrong frequently; user trust depends on correctability | Medium (modal with pre-filled fields, update entry in log) |
| M3 | **Daily goal exceeded alert** — warn when user crosses calorie goal | Medium — coach has the messages but nothing triggers them | Low (check after each entry, show coach bubble) |
| M4 | **Water tracking** — XP system already rewards `log_water` but no UI | Medium — hydration is part of nutrition tracking | Low (simple counter with glass icons) |
| M5 | **Weekly/monthly trends chart** — history exists in storage but no visualization | Medium — long-term progress is key to retention | Medium (7-day/30-day line chart of calories) |
| M6 | **Share achievements** — XP rewards `share_achievement` but no share UI | Low — social features drive engagement | Low (generate image card, share via Web Share API) |
| M7 | **Portion size confirmation** — AI estimates grams, user should confirm/adjust | High — portion estimation is the biggest error source in calorie tracking | Medium (slider or preset portions: small/medium/large) |
| M8 | **Offline support** — service worker for PWA offline mode | Medium — important for mobile use (subway, dead zones) | Medium (SW + cache strategy) |
| M9 | **Data export** — let user export their food log as CSV/JSON | Low — important for power users and data portability | Low (generate CSV from localStorage) |
| M10 | **Notification/reminder system** — remind user to eat, drink water, log meals | Medium — push notifications increase engagement | Medium (Notifications API + background timer) |

---

## Recommended UX Flow (Corrected)

### First Open

1. **Welcome Screen** -- "CalEye -- Your food, tracked automatically." Brief 3-step explainer: Camera sees food > AI identifies it > Dashboard tracks nutrition. Large CTA: "Let's start".

2. **Camera Permission** -- Dedicated screen explaining WHY camera access is needed. Privacy badge: "Everything stays on your device." Clear button: "Allow Camera Access." If denied: prominent instructions to fix it in browser settings + retry button.

3. **API Key Setup** -- Screen explaining OpenRouter/Gemini. Link to get free key. Input field with show/hide toggle. **Validate the key** with `testConnection()` before proceeding. Show success checkmark or error message. Option to skip (use app in manual-entry-only mode).

4. **Profile Setup** -- Name, gender, age, weight, height, activity level. Calorie goal (auto-calculated with manual override). Macro split preset selection (Balanced / High Protein / Keto / Custom).

5. **Coach Introduction** -- "Hi [name]! I'm Gal, your personal coach." Brief animated intro. CTA: "Let's go!"

### Daily Use

1. **App opens** -- Zustand store rehydrates from localStorage. If date changed, archive yesterday's log, reset today, update streak. Coach sends morning greeting.

2. **Dashboard view** (mobile) -- Compact webcam feed at top (16:9, inline). Below: DailySummary card (calories, macros, XP, streak). Below: HourlyChart. Below: FoodLog (newest first).

3. **Detection active** -- Green scan line on webcam. Status: "Searching..." Every 10 seconds, capture + analyze. If no food: skip silently. If food detected with confidence >= 70%:
   - If `needs_user_input`: show confirmation dialog with AI's question.
   - If multiple foods: show review dialog listing each item.
   - Otherwise: create entry, look up USDA data, show toast with food name + calories + "Undo" button.
   - Award XP (respecting daily cap).
   - Coach reacts (using full coach.ts logic).
   - Check badge unlocks.

4. **Food log interaction** -- Tap entry to expand (larger image, macro bars, AI reasoning). Edit button opens correction modal (food name, calories, macros). Swipe to delete with undo toast. "Report as incorrect" triggers correction flow + awards correction XP.

5. **If detection fails** -- Show clear error: "API key invalid" / "Rate limited, retrying in 30s" / "Network error." Don't silently return `{ eating: false }`.

6. **Coach nudges throughout the day** -- 4h no eating: "Don't forget to eat!" Close to goal: "Almost there!" Exceeded goal: "That's okay, tomorrow's a new day." Late night: "Eating late? Try something light." Balanced macros: "Perfect balance today!"

7. **End of day** -- Evening summary from coach. Final stats. Streak updated.

### Camera Tab (mobile)

Full-screen webcam view with detection controls. Coach bubble overlay. Stats sidebar (meals today, XP, level).

### Workout Tab

After heavy meals (600+ cal), show workout suggestion card from `WORKOUT_MAP`. "I did it!" button awards XP. Timer shows recommended wait time before exercising.

### Profile/Settings Tab

View/edit profile. See badges (earned + locked with descriptions). Manage API key. View history calendar. Export data. Clear all data.

---

## Architecture Notes

The codebase has significant **dead code** that represents a more complete vision:

- `stores/app-store.ts` -- Full Zustand store with persistence, badge checking, streak management, XP tracking. **Not used by DashboardPage.**
- `lib/coach.ts` -- 42 categorized coach messages with personalization. **Not used.**
- `lib/xp.ts` -- Complete XP/level/badge/streak system. **Not used.**
- `lib/storage.ts` -- localStorage persistence with history archival. **Not used.**
- `components/webcam/WebcamFeed.tsx` + `DetectionOverlay.tsx` -- Webcam display components. **Not used** (DashboardPage has its own inline webcam).
- `components/gamification/*` -- XPBar, LevelBadge, StreakCounter, BadgeShelf, LevelUpOverlay. **Not used.**
- `components/coach/CoachBubble.tsx` -- Coach message component. **Not used.**
- `components/workout/WorkoutCard.tsx` -- Workout suggestion card. **Not used.**
- `components/shared/Toast.tsx` -- Reusable toast. **Not used** (DashboardPage has inline FoodToast).
- `components/shared/ApiKeyInput.tsx` -- Reusable API key input. **Not used** (DashboardPage has inline ApiKeyModal).

**Recommendation:** The biggest single improvement would be migrating DashboardPage from local `useState` to the existing Zustand store. This would immediately unlock: data persistence, badge system, streak tracking, proper XP logic, and day-reset behavior -- all already implemented.
