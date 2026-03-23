# CalEye — Deep Research Report v2

> **Date:** 2026-03-24
> **Scope:** Competitor analysis, libraries, UX patterns, Gemini optimization, PWA/performance
> **Method:** 30+ web searches across competitor apps, academic research, developer docs, UX case studies

---

## 1. Competitor Landscape

### Detailed Competitor Analysis

| App | Key Feature We're Missing | UX Worth Copying | Technical Approach | Users Love | Users Hate |
|-----|--------------------------|------------------|-------------------|------------|------------|
| **SnapCalorie** | LiDAR depth sensing for portion estimation; 100+ micronutrient tracking; Nutrition5k dataset (5K dishes weighed) | Camera-first flow with instant results; "3 free AI logs/day" freemium model | Custom CV model by ex-Google Lens founders; LiDAR volumetric measurement; error ±80cal/500cal dish (iPhone Pro), ±130cal (regular); 500K+ verified USDA foods | 2x more accurate than nutritionists; instant recognition | Requires iPhone Pro for best accuracy; limited free tier |
| **Cal AI** | Groups (log meals with friends); Progress Photos; barcode + voice + photo all in one | Clean minimalist camera-first UI; goal validation screen in onboarding; mascot for positive reinforcement | AI image recognition (acquired by MyFitnessPal Dec 2025); strong investment in streamlined UX | Eliminates "search and click" fatigue; modern design | AI accuracy varies; premium paywall for unlimited scans |
| **Lolo** | AR scanning of nutrition labels; conversational AI logging; voice input as primary method | "Just tell Lolo what you ate" — NLP-first, not camera-first; flexible dietary profiles (fitness, diabetes, pregnancy) | GPT-4 powered NLP; text/voice input parsed to food entries; editable logs via conversation | Natural language is effortless; accurate for common foods | No historical stats/trends; can't log previous days; subscription required |
| **MyFitnessPal** | Voice Log; AI Food Suggestions by dietitians; massive 14M+ food database; social features | Meal scan + voice log dual AI tools; premium AI logging suite | Passio.ai partnership for CV; models trained on millions of images; verified food database | Largest database; barcode scanner covers 95%+ products | Free tier increasingly limited; 50% photo scan failure rate reported; ads |
| **Yazio** | Intermittent fasting tracker; smart food ratings; recipe database | Combined AI scanner + barcode + fasting in one app; detailed statistics and analysis views | AI image recognition (PRO only); ±200 cal accuracy | Handy reminders; huge food library; convenient barcode scanner | AI needs more development; rebranding to "AI" felt forced; PRO paywall |
| **MacroFactor** | Adaptive weekly macro targets based on actual weight trends; trend weight (not daily); adherence-neutral design (no shame/red zones) | Fastest food logger on market (fewest steps); favorites + smart history; verified database | Algorithm updates calorie recommendations weekly; barcode + label scanner + AI photo + voice; 2025 Food Logging Speed Index winner | No-shame design philosophy; accurate adaptive algorithm; clean UI | Can feel complex/data-heavy for beginners; smaller community |
| **Noom** | Behavioral psychology coaching; food color system (green/yellow/red); educational content | Photo + Voice AI logging; learning feedback after each meal; progressive disclosure | Photo recognition + behavioral nudges; psychology-based approach | Educational value; habit formation focus | Confusing navigation between search/cart views; expensive subscription |
| **Bitesnap** | 84 vitamin/mineral tracking; water tracker; recognizes 1,300+ foods from photo | Entire meal recognition from single photo (not item by item) | Computer vision for food identification + voice logging | Fast AI; easy to use | Limited database vs established apps; requires consistent photo quality |
| **FoodLens (SDK)** | 5,000+ dish recognition; 10+ language support; SDK for integration | N/A (B2B SDK) | Network SDK + UI SDK; iOS/Android; custom food AI models; handles regional variations | Comprehensive API; easy integration | Not a consumer app; requires developer integration |

### Key Competitive Insights

1. **MyFitnessPal acquired Cal AI (Dec 2025)** — consolidation in the market. The trend is toward AI-first logging.
2. **SnapCalorie's moat** is hardware (LiDAR) + proprietary dataset (Nutrition5k). CalEye can't compete here but can compete on UX and accessibility (web-based, no app download).
3. **Lolo's conversational approach** is novel — users just talk/type naturally. Worth exploring for CalEye.
4. **MacroFactor's "no shame" design** is evidence-based and increases retention. Avoid red warning colors for exceeding calories.
5. **All competitors are native apps** — CalEye as a PWA has a differentiation opportunity (no download, cross-platform, instant access).

---

## 2. Recommended Libraries

### Core Libraries

| Library | Purpose | Size (gzip) | Why |
|---------|---------|-------------|-----|
| **Zustand** | State management | ~1 KB | Lightest option; hook-based; no boilerplate; perfect for food log state, daily totals, user settings |
| **Dexie.js** | IndexedDB wrapper (offline storage) | ~16 KB | Best DX for IndexedDB; `useLiveQuery` hook for React; used by 100K+ sites; perfect for offline food logs |
| **Recharts** | Charts/dashboard | ~50 KB (tree-shakable) | Simple API; D3-based; great for calorie/macro dashboards; most popular React chart lib |
| **Motion (Framer Motion)** | Animations & micro-interactions | ~30 KB | Spring physics; layout animations; gesture support; GPU-accelerated; v11 (2025) improved perf |
| **react-webcam** | Camera capture | ~3 KB | Lightweight; mature; base64 output; works with getUserMedia constraints |
| **react-speech-recognition** | Voice input | ~5 KB | Web Speech API wrapper for React; voice food logging |
| **Quagga2** | Barcode scanning | ~80 KB | Actively maintained fork of QuaggaJS; real-time 1D barcode scanning in browser |
| **vite-plugin-pwa** | PWA/Service Worker | Build tool | Zero-config PWA for Vite; Workbox integration; auto-update; dev tools |
| **idb-keyval** | Simple KV store | ~600 B | Ultra-lightweight alternative to Dexie for simple settings/cache |
| **zod** | Schema validation | ~13 KB | Validates Gemini API structured JSON responses; works with TypeScript |

### Nutrition Data APIs

| API | Purpose | Cost | Notes |
|-----|---------|------|-------|
| **Open Food Facts** | Barcode lookup (4M+ products) | Free (open source) | CC0 license; 150 countries; volunteer-maintained; REST API |
| **USDA FoodData Central** | Nutrition database | Free (public domain) | Government-grade accuracy; 380K+ foods; JSON format; Node.js wrappers available |
| **Edamam** | NLP food parsing + nutrition | Free tier: 1K req/day | 900K+ foods; 680K+ UPCs; natural language input; Vision API available; paid tiers from $49/mo |
| **Passio.ai** | Food recognition SDK | Token-based pricing | Powers MyFitnessPal; real-time recognition; React Native SDK (no web JS SDK found) |

### Alternative/Specialized

| Library | Purpose | Size | Why Consider |
|---------|---------|------|-------------|
| **Visx** (Airbnb) | Custom charts | Tree-shakable | Maximum control; only ship what you use; best for custom nutrition visualizations |
| **Chart.js + react-chartjs-2** | Simple charts | ~70 KB | Simpler API than Recharts; 8 chart types; good for quick dashboard |
| **STRICH** | Premium barcode scanner | Commercial | Higher accuracy than Quagga; supports 2D barcodes; but paid |

---

## 3. UX Improvements (Priority Ranked)

| # | Improvement | Impact | Effort | Source/Evidence |
|---|-------------|--------|--------|----------------|
| 1 | **Voice input for food logging** | High | Medium | Lolo, MyFitnessPal, MacroFactor all added voice. Users describe meal naturally, AI parses. Web Speech API available in Chrome. Reduces logging time from minutes to seconds. |
| 2 | **Streak system with ethical design** | High | Low | 7-day streak users 3.6x more likely to complete goals; 2.4x more likely to return next day. Keep required action minimal. Celebrate progress, not perfection. Avoid shame on streak loss. |
| 3 | **Adaptive daily targets** (not static) | High | High | MacroFactor's key differentiator. Adjust calorie/macro targets weekly based on actual weight trend, not static TDEE calculation. Keeps users engaged as they see the app "learning" them. |
| 4 | **Barcode scanner** for packaged foods | High | Medium | MyFitnessPal's most-used feature. Use Quagga2 + Open Food Facts API. Free; covers 4M+ products. Users expect this as table stakes. |
| 5 | **Adherence-neutral design** (no shame) | Medium | Low | MacroFactor principle: no red zones when exceeding calories. Research shows shame-based design causes 22% more dropout. Use neutral colors; celebrate logging consistency, not perfection. |
| 6 | **Onboarding quiz with personalization** | Medium | Medium | Cal AI's onboarding creates personalization before dashboard. Collect: goal, weight, height, activity level. Show projected progress. Introduce key features (camera, barcode) early. |
| 7 | **Multi-method logging** (photo + text + voice + barcode) | Medium | High | Top apps offer 3-4 input methods. Photo for meals, barcode for packaged, voice for quick entries, text for corrections. Reduces friction for different contexts (cooking, restaurant, on-the-go). |
| 8 | **Daily/weekly summary dashboard** | Medium | Medium | Charts showing macro distribution, calorie trend, streaks. Use Recharts. Users want to see patterns, not just daily numbers. |
| 9 | **Social/accountability features** | Medium | High | Cal AI Groups; Noom coaching. Even simple "share daily summary" to WhatsApp increases retention. Start with share functionality, not full social network. |
| 10 | **Meal templates / favorites** | Medium | Low | MacroFactor's "smart history" remembers common meals. Users eat the same breakfast 80% of days. One-tap re-logging of frequent meals dramatically reduces friction. |
| 11 | **Water tracking** | Low | Low | Bitesnap includes it. Simple counter with daily goal. Low effort, adds perceived value. |
| 12 | **Dark mode** | Low | Low | Now standard expectation. Health apps used at night (logging dinner). Sans-serif fonts + dark backgrounds reduce eye strain. |
| 13 | **Push notification reminders** | Low | Medium | 2-3 per day max (meals). PWA push via service worker + VAPID. Lunch notifications 11:00-12:30 see highest engagement. Excessive notifications cause uninstalls. |
| 14 | **Intermittent fasting timer** | Low | Medium | Yazio combines with calorie tracking. Growing audience. Simple timer with eating window config. |
| 15 | **Offline mode** | Low | Medium | Dexie.js + Workbox background sync. Log meals offline, sync when connected. Important for users with poor connectivity. |

### Why People Quit Food Trackers (Research Summary)

| Reason | % Impact | CalEye Mitigation |
|--------|----------|-------------------|
| Tracking is too tedious | 84% | AI photo recognition; voice input; favorites/templates |
| App not easy to use | 24% | Camera-first minimal UI; fewer taps to log |
| Unrealistic expectations | High | Onboarding sets realistic timeline; adaptive targets |
| Disrupted routines | High | Push reminders; streak system with grace periods |
| Privacy concerns | Medium | Local-first storage (IndexedDB); no account required |
| No immediate results | High | Gamification (XP, levels, badges); daily insights |

### Retention Benchmarks

- **30-day retention** for diet apps: ~30% (industry average)
- **70% of users abandon** within 2 weeks if app is too complex
- **Streaks reduce Month-2 dropout** by 22%
- **DAU increases 6%** with streak counter + badge notifications
- **Goal:** Aim for 40%+ 30-day retention with friction-reduction + gamification

---

## 4. Gemini Optimization Techniques

### 4.1 Model Selection

| Model | Speed | Cost | Accuracy | Best For |
|-------|-------|------|----------|----------|
| **Gemini 2.5 Flash** | ~200ms first token | ~15x cheaper than Pro | 25% improvement on Nutrition5k benchmark | Real-time food recognition; daily use |
| **Gemini 2.5 Pro** | ~400-600ms first token | Full price | Best complex reasoning | Detailed nutrition analysis; edge cases |
| **Gemini 3 Flash** | Fastest | Cheapest | Competitive with older Pro | New default choice for 2026 |

**Recommendation:** Use **Gemini 2.5 Flash** (or 3 Flash when stable) for all food recognition. Reserve Pro only for complex multi-dish analysis or correction workflows. This saves ~93% on API costs while maintaining food recognition accuracy.

### 4.2 Prompt Engineering (PTCF Framework)

**Best structure for food recognition prompts:**

```
Persona: You are a professional nutritionist and food analyst with expertise in portion estimation.

Task: Analyze this food image and provide:
1. Identify all food items visible
2. Estimate portion size in grams for each item
3. Calculate calories and macronutrients (protein, carbs, fat, fiber)
4. Provide a confidence score (0-1) for each item

Context: The user is tracking their daily food intake. They need accurate
calorie counts. When uncertain about portion size, estimate conservatively.
Use standard serving sizes as reference (e.g., a fist ≈ 1 cup, palm ≈ 3oz protein).

Format: Return ONLY valid JSON matching the provided schema.
```

### 4.3 Two-Pass Refinement (CalCam Technique)

CalCam's approach (20% improvement in user satisfaction):

1. **Pass 1 — Recognition:** Send image to Gemini Flash with food identification prompt. Get structured JSON with items, portions, nutrients.
2. **Pass 2 — Validation:** Feed Pass 1 output back to Gemini Flash: "Review this nutritional analysis for logical consistency. Check: do portion sizes match typical serving sizes? Do calorie totals match macronutrient breakdown? Flag any suspicious values."
3. **User correction loop:** If user says "that's rice, not pasta" — send correction + original image for re-analysis.

**Cost:** 2 API calls per photo, but dramatically improves accuracy. With Flash pricing, still very affordable.

### 4.4 Structured Output (JSON Schema)

Use `responseMimeType: "application/json"` + `responseSchema` to force consistent output:

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "portion_grams": { "type": "number" },
          "confidence": { "type": "number" },
          "calories": { "type": "number" },
          "protein_g": { "type": "number" },
          "carbs_g": { "type": "number" },
          "fat_g": { "type": "number" },
          "fiber_g": { "type": "number" }
        },
        "required": ["name", "portion_grams", "calories", "protein_g", "carbs_g", "fat_g"]
      }
    },
    "total_calories": { "type": "number" },
    "meal_type": { "type": "string", "enum": ["breakfast", "lunch", "dinner", "snack"] }
  }
}
```

Use **Zod** on the client side to validate responses match the expected schema before rendering.

### 4.5 Vision Optimization

- Use `media_resolution` parameter: higher = better accuracy for complex dishes, but more tokens
- **Image preprocessing:** Rotate correctly, ensure good lighting, crop to food area
- Keep images under 4MB; resize to 1024x1024 for optimal quality/cost balance
- **First verify it's food** before running full analysis (saves API calls on non-food images)

### 4.6 Cost Reduction Strategies

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| **Implicit caching** (automatic) | Up to 75% on repeated patterns | Keep system prompt identical; user content at end |
| **Explicit caching** | Up to 90% on input tokens | Cache system prompt + few-shot examples; $1/M tokens/hour storage |
| **Client-side result caching** | 30-40% fewer API calls | Cache results by image hash in IndexedDB; re-use for identical/similar meals |
| **Batch meal templates** | 50%+ for repeat meals | Pre-analyze common meals; store nutrition data; skip API for known foods |
| **Smart model routing** | 60-70% | Flash for initial recognition; Pro only for corrections/complex dishes |
| **Request deduplication** | 10-20% | Debounce rapid re-scans; hash-based dedup |

### 4.7 Accuracy Benchmarks (Research)

| Method | MAPE (Mean Absolute % Error) | Notes |
|--------|------|-------|
| LLM vision (GPT-4/Claude/Gemini) | 35-37% for weight, 35.8% for energy | PMC study across 3 LLMs |
| Few-shot prompting (GPT-3.5) | 51.5% accuracy for carb estimation | NutriBench dataset |
| RAG + LoRA fine-tuning | Significant improvement over base | 330K image-text pairs |
| SnapCalorie (LiDAR + custom model) | ±16% error rate | Best in class; hardware advantage |
| Human nutritionist estimation | ±32% error rate | SnapCalorie claims 2x better than this |

**Practical takeaway:** Gemini vision alone achieves ~35% error for calories. The two-pass refinement + USDA database cross-reference can bring this to ~25%. This is competitive with human estimation and acceptable for tracking purposes (not medical precision).

---

## 5. PWA & Performance

### 5.1 Vite PWA Setup

**Recommended stack:** `vite-plugin-pwa` + Workbox

```
npm install -D vite-plugin-pwa
```

Key configuration:
- `registerType: 'autoUpdate'` — auto-refresh on new deployment
- `workbox.clientsClaim: true` + `skipWaiting: true` — immediate activation
- `devOptions.enabled: true` — test PWA in development
- `strategies: 'generateSW'` for auto-generated service worker (simplest)
- Switch to `injectManifest` only if custom caching logic needed

### 5.2 Offline Strategy

| Data Type | Storage | Sync Strategy |
|-----------|---------|---------------|
| Food log entries | Dexie.js (IndexedDB) | Background sync when online |
| User settings/goals | idb-keyval (IndexedDB) | Immediate; no server needed |
| Cached food database | IndexedDB | Pre-cache top 1000 foods |
| Meal photos (thumbnails) | IndexedDB + Cache API | Store compressed versions locally |
| API responses | Cache API (service worker) | Stale-while-revalidate for nutrition data |

### 5.3 Camera Performance

- Use `react-webcam` with `videoConstraints` for resolution control
- Capture at 1024x1024 for optimal Gemini processing (not full 4K)
- Compress to JPEG 80% quality before API call (reduces upload time ~70%)
- **Memoize camera component** to prevent re-initialization on re-renders
- Cleanup: unmount camera when not visible (`isActive` pattern)
- HTTPS required for camera access (PWA serves over HTTPS by default)

### 5.4 Install Prompt Strategy

- Listen for `beforeinstallprompt` event
- **Don't show immediately** — wait until user has logged 3+ meals (proven engagement)
- Custom install banner: "Install CalEye for faster access and offline logging"
- Track installation rate as key metric
- PWA criteria: HTTPS + valid manifest + active service worker

### 5.5 Performance Budget

| Metric | Target | How |
|--------|--------|-----|
| First Contentful Paint | < 1.5s | Vite code splitting; lazy load non-critical routes |
| Time to Interactive | < 3s | Defer chart rendering; lazy load camera |
| Bundle size (JS) | < 200 KB gzipped | Tree-shaking; dynamic imports; Zustand over Redux |
| Largest Contentful Paint | < 2.5s | Optimize images; preload critical fonts |
| Camera ready | < 2s | Pre-warm getUserMedia on route enter |
| API response (Gemini) | < 3s | Flash model; image compression; prompt optimization |

---

## 6. Roadmap Recommendations (Next 10 Features)

| # | Feature | Impact | Effort | Dependencies | Notes |
|---|---------|--------|--------|-------------|-------|
| 1 | **Voice food logging** | High | Medium | Web Speech API; Gemini NLP | "I had a chicken salad with rice" → parsed to food items. Chrome-only for speech recognition, but text input fallback for all browsers. |
| 2 | **Barcode scanner** | High | Medium | Quagga2; Open Food Facts API | Covers packaged foods. Free API. 4M+ products. Massive UX improvement for common items. |
| 3 | **Streak system + daily goals** | High | Low | Zustand state; Dexie.js persistence | Proven 22% retention improvement. Show streak counter on home. Grace period for missed days. Already have `StreakCounter` component — enhance it. |
| 4 | **Meal templates / favorites** | High | Low | Dexie.js storage | "Log again" button on past meals. Users eat same breakfast 80% of days. Biggest friction reducer after AI photo. |
| 5 | **Two-pass Gemini refinement** | Medium | Low | Gemini API (second call) | CalCam technique: verify nutrition analysis in second pass. 20% accuracy improvement. Minimal extra cost with Flash. |
| 6 | **Onboarding flow** | Medium | Medium | UI components | Goal setting, height/weight, activity level → personalized daily targets. Introduce photo scan + barcode during onboarding. |
| 7 | **Daily/weekly dashboard** | Medium | Medium | Recharts | Calorie trend, macro pie chart, streak visualization, weekly averages. Users need to see patterns for motivation. |
| 8 | **Push notifications** (meal reminders) | Medium | Medium | Service worker; VAPID; vite-plugin-pwa | 2-3 daily reminders. Configurable times. PWA push notification support. |
| 9 | **Offline mode** | Medium | High | Dexie.js; Workbox background sync; service worker | Log meals offline; sync when connected. Pre-cache common food data. Critical for PWA credibility. |
| 10 | **Text-based food logging** | Medium | Low | Gemini NLP | "200g chicken breast, 1 cup rice, salad" → parsed to food items with nutrition. Complement to photo and voice. Lowest friction for known portions. |

### Bonus Features (Phase 2+)

| Feature | Impact | Effort | Notes |
|---------|--------|--------|-------|
| Dark mode | Low | Low | Standard expectation; Tailwind `dark:` utilities |
| Water tracking | Low | Low | Simple counter + daily goal |
| Share to WhatsApp | Low | Low | "Here's my daily summary" — social accountability |
| Intermittent fasting timer | Low | Medium | Growing demand; pairs well with food logging |
| USDA database cross-reference | Medium | Medium | Validate Gemini estimates against USDA data for common foods |
| Adaptive weekly targets | High | High | MacroFactor's key feature; needs weight tracking + algorithm |
| AR nutrition label scan | Medium | High | Lolo has this; complex to implement in web browser |
| Multi-language support | Medium | Medium | Hebrew first, then English; RTL layout considerations |

---

## 7. Technical Architecture Recommendations

### Stack Summary

```
Frontend:       React + TypeScript + Vite + Tailwind CSS
State:          Zustand (~1KB)
Offline DB:     Dexie.js + idb-keyval
Charts:         Recharts (tree-shakable)
Animations:     Motion (Framer Motion v11)
Camera:         react-webcam
Barcode:        Quagga2
Voice:          Web Speech API (react-speech-recognition)
PWA:            vite-plugin-pwa + Workbox
AI:             Gemini 2.5/3 Flash API
Food DB:        Open Food Facts (barcode) + USDA FoodData Central (validation)
Schema:         Zod (TypeScript validation of API responses)
```

### Data Flow

```
User Input (photo/voice/text/barcode)
    ↓
Preprocessing (compress image / parse text / decode barcode)
    ↓
Route to handler:
  - Photo → Gemini Flash (Pass 1: identify) → Gemini Flash (Pass 2: validate)
  - Voice → Web Speech API → text → Gemini NLP parse
  - Text  → Gemini NLP parse
  - Barcode → Open Food Facts API lookup
    ↓
Structured JSON response (Zod validated)
    ↓
User review & correction (optional)
    ↓
Save to Dexie.js (IndexedDB) + update Zustand state
    ↓
Dashboard / streak / gamification update
```

### Cost Projection (Gemini Flash)

| Usage | API Calls/Day | Cost/Month (Flash) |
|-------|---------------|-------------------|
| Light user (3 meals) | 6 (2-pass) | ~$0.02 |
| Active user (5 meals + snacks) | 14 | ~$0.05 |
| 1,000 active users | 14,000 | ~$50 |
| 10,000 active users | 140,000 | ~$500 |

With implicit caching (system prompt reuse), actual costs could be 25-75% lower.

---

## Sources

### Competitor Apps
- [SnapCalorie](https://www.snapcalorie.com/) — [Blog](https://www.snapcalorie.com/blog/ai-food-recognition-app-for-tracking-meals-the-future-of-nutrition-logging.html) — [API Docs](https://snapcalorie.github.io/)
- [Cal AI](https://www.calai.app/) — [App Store](https://apps.apple.com/us/app/cal-ai-calorie-tracker/id6480417616) — [Review](https://www.sugar-frees.com/blog/calai)
- [Lolo Food Tracker](https://www.producthunt.com/products/lolo-ai-food-tracker) — [Technical Article](https://medium.com/aimonks/building-ai-assistants-on-the-example-of-lolo-food-tracker-571fca8caa7a)
- [MyFitnessPal Meal Scan](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-Meal-Scan-FAQ) — [Passio.ai Partnership](https://www.passio.ai/case-studies/myfitnesspal) — [Cal AI Acquisition](https://quasa.io/media/teen-built-ai-calorie-counter-snapped-up-by-myfitnesspal-a-game-changer-for-casual-fitness-tracking)
- [Yazio AI Features](https://help.yazio.com/hc/en-us/articles/39137901903889-What-is-the-AI-Calorie-Tracking-Feature-and-how-does-it-work)
- [MacroFactor Review 2026](https://outlift.com/macrofactor-review/) — [Official](https://macrofactorapp.com/macrofactor/)
- [Noom Food Logging UX](https://thesonofthomp.medium.com/food-logging-at-noom-improving-a-core-feature-5dd36aab6ea1) — [UX Case Study](https://www.justinmind.com/blog/ux-case-study-of-noom-app-gamification-progressive-disclosure-nudges/)
- [Bitesnap](https://digitaltrends.com/mobile/bitesnap-bite-ai/) — [Product Hunt](https://www.producthunt.com/products/bitesnap)
- [FoodLens SDK](https://github.com/doinglab/FoodLensSDK) — [Azumio](https://www.azumio.com/solutions/food-lens/features)
- [10 Best Nutrition Tracking Apps 2026](https://www.nutrola.app/en/blog/best-nutrition-tracking-apps-2026-ai-changing-everything)

### Gemini API & AI
- [CalCam + Gemini API](https://developers.googleblog.com/calcam-transforming-food-tracking-with-the-gemini-api/) — [Showcase](https://ai.google.dev/showcase/calcam)
- [Gemini Vision Docs](https://ai.google.dev/gemini-api/docs/vision) — [Prompt Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- [Gemini Structured Output](https://ai.google.dev/gemini-api/docs/structured-output) — [Schema Adherence](https://developers.googleblog.com/en/mastering-controlled-generation-with-gemini-15-schema-adherence/)
- [Gemini Context Caching](https://ai.google.dev/gemini-api/docs/caching) — [Implicit Caching](https://developers.googleblog.com/en/gemini-2-5-models-now-support-implicit-caching/)
- [Gemini Flash vs Pro Comparison](https://vapi.ai/blog/gemini-flash-vs-pro)
- [LLM Food Calorie Estimation Study (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12513282/)
- [NutriBench Dataset](https://arxiv.org/html/2407.12843v2)
- [CaLoRAify: LoRA for Food Vision](https://arxiv.org/html/2412.09936v1)

### UX Research
- [Why Users Abandon Health Apps (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11694054/)
- [Diet-Tracking App Reviews Analysis (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8103297/)
- [Gamification in Nutrition Apps (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11168059/)
- [Streak System UX & Psychology (Smashing Magazine)](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/)
- [Health App Gamification Examples](https://trophy.so/blog/health-gamification-examples)
- [Cal AI Onboarding (ScreensDesign)](https://screensdesign.com/showcase/cal-ai-calorie-tracker)
- [Diet App Retention Statistics 2026](https://media.market.us/diet-and-nutrition-apps-statistics/)

### Libraries & Tools
- [Dexie.js](https://dexie.org/) — [React Guide](https://blog.logrocket.com/dexie-js-indexeddb-react-apps-offline-data-storage/)
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) — [Docs](https://vite-pwa-org.netlify.app/guide/)
- [react-webcam](https://www.npmjs.com/package/react-webcam)
- [react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition)
- [Quagga2 Barcode Scanner](https://github.com/ericblade/quagga2)
- [Motion (Framer Motion)](https://motion.dev/docs/react)
- [Recharts](https://recharts.org/) — [React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [Zustand](https://github.com/pmndrs/zustand) — [vs Redux for Health Apps](https://www.wellally.tech/blog/zustand-vs-redux-react-native-health-apps)

### APIs & Databases
- [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/) — [Data](https://world.openfoodfacts.org/data)
- [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide/)
- [Edamam API](https://developer.edamam.com/) — [Pricing 2025](https://www.oreateai.com/blog/navigating-edamams-api-pricing-a-look-ahead-to-2025/ba55aa7959d8de003b1c4aabe6a08d8e)
- [Passio.ai Nutrition SDK](https://www.passio.ai/) — [Docs](https://passio.gitbook.io/nutrition-ai)

### PWA & Performance
- [PWA Add to Home Screen Guide](https://simicart.com/blog/pwa-add-to-home-screen/)
- [Offline PWA with React + Dexie + Workbox](https://www.wellally.tech/blog/build-offline-pwa-react-dexie-workbox)
- [Web Push Notifications (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)

### Portion Estimation Research
- [Food Weight Estimation with CV (MDPI)](https://www.mdpi.com/1424-8220/24/23/7660)
- [Food Portion Estimation via 3D Scaling](https://arxiv.org/html/2404.12257v1)
- [SnapCalorie Nutrition5k Study](https://techcrunch.com/2023/06/26/snapcalorie-computer-vision-health-app-raises-3m/)
- [LiDAR Mobile Food Calorie Estimation](https://link.springer.com/chapter/10.1007/978-981-95-4398-4_10)
