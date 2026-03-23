import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import { useWebcam } from '../../hooks/useWebcam';
import { useFoodDetection } from '../../hooks/useFoodDetection';
import { getApiKey, setApiKey } from '../../lib/gemini';
import { lookupNutrition } from '../../lib/nutrition';
import { getPostMealMessage } from '../../lib/coach';
import { useAppStore } from '../../stores/app-store';
import Header from '../layout/Header';
import MainLayout from '../layout/MainLayout';
import DailySummary from './DailySummary';
import HourlyChart from './HourlyChart';
import FoodLog from './FoodLog';
import ConfirmFoodDialog from '../shared/ConfirmFoodDialog';
import EditFoodDialog from '../shared/EditFoodDialog';
import WelcomeScreen from '../shared/WelcomeScreen';
import type { FoodEntry, UserProfile } from '../../types';

type FacingMode = 'user' | 'environment';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildHourlyData(entries: FoodEntry[]) {
  const hours: { hour: number; calories: number; foods: string[] }[] = [];
  for (let h = 6; h <= 23; h++) {
    hours.push({ hour: h, calories: 0, foods: [] });
  }
  for (const entry of entries) {
    const hour = new Date(entry.timestamp).getHours();
    const bucket = hours.find((b) => b.hour === hour);
    if (bucket) { bucket.calories += entry.calories; bucket.foods.push(entry.foodHe); }
  }
  return hours;
}

/** Translate error codes to Hebrew user-facing messages */
function getErrorMessage(error: string): string {
  switch (error) {
    case 'NO_API_KEY':
      return 'לא הוזן מפתח API — לחץ כאן לעדכון';
    case 'INVALID_API_KEY':
      return 'מפתח API לא תקין — לחץ לעדכון';
    case 'RATE_LIMITED':
      return 'חריגה ממכסת API — ינסה שוב בעוד 30 שניות';
    case 'NETWORK_ERROR':
      return 'שגיאה בזיהוי — בדוק את חיבור האינטרנט';
    default:
      return `שגיאה: ${error}`;
  }
}

/** Check if this is a persistent error that needs a banner (vs toast) */
function isPersistentError(error: string): boolean {
  return error === 'NO_API_KEY' || error === 'INVALID_API_KEY';
}

/** Fallback profile used when the store has no profile yet (first-time user). */
const DEFAULT_PROFILE: UserProfile = {
  name: 'משתמש',
  gender: 'male',
  age: 30,
  weight: 75,
  height: 175,
  activityLevel: 'active',
  calorieGoal: 2000,
  macroSplit: { protein: 30, carbs: 40, fat: 30 },
  level: 1,
  totalXP: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: getTodayDate(),
  badges: [],
  streakFreezesUsed: 0,
  joinDate: getTodayDate(),
  workoutsConfirmed: 0,
  foodCorrections: 0,
  uniqueFoodsDetected: [],
};

// ── Toast Component ─────────────────────────────────────────────────────────

function FoodToast({ entry, onClose }: { entry: FoodEntry; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-20 left-3 right-3 sm:left-4 sm:right-auto z-50 p-4 sm:p-5 rounded-2xl max-w-sm"
      style={{
        background: 'rgba(26,26,46,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(34,217,127,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,217,127,0.1)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold text-white mb-1.5 truncate">
            🍽️ {entry.foodHe}
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sora gradient-text-glow">
            {entry.calories} <span className="text-sm text-text-tertiary" style={{ WebkitTextFillColor: 'initial', background: 'none' }}>קק״ל</span>
          </div>
          <div className="flex gap-3 mt-2">
            <span className="macro-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-macro-protein" />
              <span className="text-macro-protein text-xs">ח:{entry.protein}g</span>
            </span>
            <span className="macro-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-macro-carbs" />
              <span className="text-macro-carbs text-xs">פ:{entry.carbs}g</span>
            </span>
            <span className="macro-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-macro-fat" />
              <span className="text-macro-fat text-xs">ש:{entry.fat}g</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: entry.confidence > 0.85 ? '#22c55e' : '#f59e0b',
                boxShadow: `0 0 4px ${entry.confidence > 0.85 ? '#22c55e' : '#f59e0b'}44`,
              }}
            />
            <span className="text-xs text-text-tertiary">
              ביטחון {Math.round(entry.confidence * 100)}%
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-text-tertiary hover:text-white text-lg min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ── Error Toast ────────────────────────────────────────────────────────────────

function ErrorToast({ message, onClick, onClose }: { message: string; onClick?: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-20 left-3 right-3 sm:left-4 sm:right-auto z-50 p-4 rounded-2xl max-w-sm cursor-pointer"
      style={{
        background: 'rgba(46,26,26,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239,68,68,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">⚠️</span>
            <span className="text-xs font-semibold text-red-400">שגיאה</span>
          </div>
          <div className="text-sm text-red-300 leading-relaxed">{message}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="text-text-tertiary hover:text-white text-lg min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ── Persistent Error Banner ──────────────────────────────────────────────────

function ErrorBanner({ message, onClick }: { message: string; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-14 sm:top-16 inset-x-0 z-40 px-4 py-2.5 text-center text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
      style={{
        background: 'rgba(239,68,68,0.12)',
        borderBottom: '1px solid rgba(239,68,68,0.2)',
        color: '#fca5a5',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onClick}
    >
      <span className="text-xs">🔑</span>
      {message}
    </motion.div>
  );
}

// ── API Key Modal ──────────────────────────────────────────────────────────

function ApiKeyModal({ onSave, onClose }: { onSave: (key: string) => void; onClose: () => void }) {
  const [key, setKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-2xl max-w-md w-full"
        style={{
          background: 'rgba(26, 26, 46, 0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(34,217,127,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(34,217,127,0.2)',
            }}
          >
            👁️
          </div>
          <h2 className="text-xl font-bold text-white font-sora">CalEye</h2>
          <p className="text-sm text-text-tertiary mt-1">חיבור ל-AI Vision</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'rgba(34,217,127,0.2)', color: '#22D97F' }}>1</span>
            <span className="text-xs text-text-tertiary">מפתח API</span>
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>2</span>
            <span className="text-xs text-text-tertiary">מצלמה</span>
          </div>
          <div className="w-8 h-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>3</span>
            <span className="text-xs text-text-tertiary">זיהוי</span>
          </div>
        </div>

        {/* API Key input card */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🔗</span>
            <span className="text-sm font-bold text-white">OpenRouter API Key</span>
          </div>
          <p className="text-xs text-text-tertiary mb-3 leading-relaxed">
            CalEye משתמש ב-OpenRouter כדי לזהות אוכל דרך המצלמה.
            <br />המפתח נשמר רק במכשיר שלך — לא נשלח לשום מקום.
          </p>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs font-medium mb-3 hover:underline"
            style={{ color: '#22D97F' }}
          >
            קבל מפתח חינם מ-OpenRouter →
          </a>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-or-..."
              className="w-full p-3 pr-10 rounded-xl text-white text-sm font-mono transition-all focus:ring-1 focus:ring-accent/30 focus:outline-none"
              style={{
                background: 'rgba(10, 14, 23, 0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && key.trim() && onSave(key.trim())}
              dir="ltr"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white text-xs transition-colors"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => key.trim() && onSave(key.trim())}
            disabled={!key.trim()}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: key.trim()
                ? 'linear-gradient(135deg, #22D97F, #06B6D4)'
                : 'rgba(34,217,127,0.15)',
              color: key.trim() ? '#0a0e17' : 'rgba(255,255,255,0.3)',
              boxShadow: key.trim() ? '0 4px 16px rgba(34,217,127,0.2)' : undefined,
            }}
          >
            התחל לעקוב
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-text-tertiary hover:text-white text-sm transition-all hover:bg-white/[0.05]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            ✕
          </button>
        </div>

        <p className="text-center text-xs text-text-tertiary mt-3 flex items-center justify-center gap-1">
          <span>🔒</span> המפתח נשמר ב-localStorage בלבד
        </p>
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Zustand store selectors ────────────────────────────────────────────────
  const todayLog = useAppStore((s) => s.todayLog);
  const storeProfile = useAppStore((s) => s.profile);
  const coachMessages = useAppStore((s) => s.coachMessages);

  // Store actions — stable references (no re-render on call)
  const addFoodEntry = useAppStore((s) => s.addFoodEntry);
  const addXP = useAppStore((s) => s.addXP);
  const addCoachMessage = useAppStore((s) => s.addCoachMessage);

  // Handle null profile (first-time user): initialize default in store
  useEffect(() => {
    if (!storeProfile) {
      useAppStore.setState({ profile: DEFAULT_PROFILE });
    }
  }, [storeProfile]);

  // Non-null profile for rendering — always has a value
  const profile: UserProfile = storeProfile ?? DEFAULT_PROFILE;

  // Latest coach message for display
  const latestCoachMsg = coachMessages.length > 0
    ? coachMessages[coachMessages.length - 1] ?? null
    : null;

  // ── Local UI state (not persisted) ─────────────────────────────────────────
  const [toast, setToast] = useState<FoodEntry | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Confirmation dialog state (low confidence / needs_user_input)
  const [confirmEntry, setConfirmEntry] = useState<FoodEntry | null>(null);
  const [confirmQuestion, setConfirmQuestion] = useState<string | undefined>(undefined);

  // Edit dialog state
  const [editEntry, setEditEntry] = useState<FoodEntry | null>(null);

  // Welcome screen: show when no API key AND no food log history
  const hasApiKey = !!getApiKey();
  const hasHistory = todayLog.entries.length > 0;
  const [showWelcome, setShowWelcome] = useState(!hasApiKey && !hasHistory);

  // Webcam
  const { webcamRef, status: webcamStatus, isReady, capture, error: webcamError } = useWebcam();

  // Food detection callbacks — use store actions
  const onFoodDetected = useCallback((entry: FoodEntry) => {
    addFoodEntry(entry);

    // Generate coach message using the coach module
    const currentProfile = useAppStore.getState().profile ?? DEFAULT_PROFILE;
    const coachText = getPostMealMessage(entry, currentProfile);

    const isHealthy = entry.calories < 400;
    addCoachMessage({
      text: coachText,
      category: isHealthy ? 'healthy_meal' : 'unhealthy_meal',
    });
  }, [addFoodEntry, addCoachMessage]);

  const onToast = useCallback((entry: FoodEntry) => {
    setToast(entry);
    setTimeout(() => setToast(null), 5000);
  }, []);

  const onXpAwarded = useCallback((xp: number) => {
    addXP(xp, 'food_detected');
  }, [addXP]);

  // Confirmation callback for low-confidence detections
  const onNeedsConfirmation = useCallback((entry: FoodEntry, userQuestion?: string) => {
    setConfirmEntry(entry);
    setConfirmQuestion(userQuestion);
  }, []);

  // Detection hook
  const { isDetecting, isPending, toggleDetection, error: detectionError } = useFoodDetection({
    captureFrame: capture,
    onFoodDetected,
    onToast,
    onXpAwarded,
    isWebcamReady: isReady,
    onNeedsConfirmation,
  });

  // Show error toast when detection error occurs (transient errors)
  useEffect(() => {
    if (detectionError && !isPersistentError(detectionError)) {
      setErrorToast(getErrorMessage(detectionError));
      const timer = setTimeout(() => setErrorToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [detectionError]);

  // Delete entry handler
  const onDeleteEntry = useCallback((entryId: string) => {
    const state = useAppStore.getState();
    const entry = state.todayLog.entries.find((e) => e.id === entryId);
    if (!entry) return;

    const newEntries = state.todayLog.entries.filter((e) => e.id !== entryId);
    const totals = newEntries.reduce(
      (acc, e) => ({
        totalCalories: acc.totalCalories + e.calories,
        totalProtein: acc.totalProtein + e.protein,
        totalCarbs: acc.totalCarbs + e.carbs,
        totalFat: acc.totalFat + e.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    );

    useAppStore.setState({
      todayLog: {
        ...state.todayLog,
        entries: newEntries,
        ...totals,
      },
    });
  }, []);

  // Edit entry handler — opens EditFoodDialog
  const onEditEntry = useCallback((entry: FoodEntry) => {
    setEditEntry(entry);
  }, []);

  // Save edited entry — replace in store
  const handleEditSave = useCallback((updated: FoodEntry) => {
    const state = useAppStore.getState();
    const newEntries = state.todayLog.entries.map((e) => e.id === updated.id ? updated : e);
    const totals = newEntries.reduce(
      (acc, e) => ({
        totalCalories: acc.totalCalories + e.calories,
        totalProtein: acc.totalProtein + e.protein,
        totalCarbs: acc.totalCarbs + e.carbs,
        totalFat: acc.totalFat + e.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    );
    useAppStore.setState({
      todayLog: {
        ...state.todayLog,
        entries: newEntries,
        ...totals,
      },
    });
    setEditEntry(null);
  }, []);

  // Confirm dialog handlers
  const handleConfirm = useCallback((entry: FoodEntry) => {
    onFoodDetected(entry);
    onToast(entry);
    onXpAwarded(5);
    setConfirmEntry(null);
    setConfirmQuestion(undefined);
  }, [onFoodDetected, onToast, onXpAwarded]);

  const handleConfirmEdit = useCallback(async (entry: FoodEntry, newGrams: number) => {
    // Recalculate from USDA with new grams
    const usdaData = await lookupNutrition(entry.food, newGrams);
    const updatedEntry = usdaData
      ? { ...entry, calories: usdaData.calories, protein: usdaData.protein, carbs: usdaData.carbs, fat: usdaData.fat }
      : entry;

    onFoodDetected(updatedEntry);
    onToast(updatedEntry);
    onXpAwarded(5);
    setConfirmEntry(null);
    setConfirmQuestion(undefined);
  }, [onFoodDetected, onToast, onXpAwarded]);

  const handleConfirmReject = useCallback(() => {
    setConfirmEntry(null);
    setConfirmQuestion(undefined);
  }, []);

  // Hourly data
  const hourlyData = useMemo(() => buildHourlyData(todayLog.entries), [todayLog.entries]);

  // API key save
  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setShowApiKey(false);
  };

  // Welcome complete handler
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Status text
  const statusText = isPending ? 'מנתח...' : isDetecting ? 'מחפש...' : 'מושהה';
  const statusColor = isPending ? '#f59e0b' : isDetecting ? '#22D97F' : '#6b7280';

  // Webcam card border color — red when there's a detection error
  const webcamBorderColor = detectionError
    ? 'rgba(239,68,68,0.4)'
    : `${statusColor}40`;

  // ── Welcome Screen ─────────────────────────────────────────────────────────
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <>
      <Header profile={profile} onSettingsClick={() => setShowApiKey(true)} />

      {/* Persistent error banner for API key issues */}
      {detectionError && isPersistentError(detectionError) && (
        <ErrorBanner
          message={getErrorMessage(detectionError)}
          onClick={() => setShowApiKey(true)}
        />
      )}

      {/* Food detection toast */}
      <AnimatePresence>
        {toast && <FoodToast entry={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Error toast (transient errors) */}
      <AnimatePresence>
        {errorToast && !toast && (
          <ErrorToast
            message={errorToast}
            onClose={() => setErrorToast(null)}
          />
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      {showApiKey && <ApiKeyModal onSave={handleApiKeySave} onClose={() => setShowApiKey(false)} />}

      {/* Confirm Food Dialog (low confidence / needs_user_input) */}
      {confirmEntry && (
        <ConfirmFoodDialog
          entry={confirmEntry}
          userQuestion={confirmQuestion}
          onConfirm={handleConfirm}
          onEdit={handleConfirmEdit}
          onReject={handleConfirmReject}
        />
      )}

      {/* Edit Food Dialog */}
      {editEntry && (
        <EditFoodDialog
          entry={editEntry}
          onSave={handleEditSave}
          onDelete={(id) => { onDeleteEntry(id); setEditEntry(null); }}
          onClose={() => setEditEntry(null)}
        />
      )}

      <MainLayout
        mobileTopCard={
          /* Compact 16:9 webcam card for mobile — shown inline above dashboard */
          <div
            className="rounded-2xl overflow-hidden relative cursor-pointer aspect-video"
            style={{
              background: '#0a0a0f',
              border: `1px solid ${webcamBorderColor}`,
              boxShadow: `0 4px 16px ${webcamBorderColor}`,
            }}
            onClick={toggleDetection}
          >
            {webcamStatus === 'active' || webcamStatus === 'requesting' ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 640, height: 480, facingMode }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-text-tertiary text-sm">{webcamError || 'מצלמה לא פעילה'}</span>
              </div>
            )}
            {/* Camera flip button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
              }}
              className="absolute top-2 left-2 w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-transform duration-200 active:scale-90"
              style={{
                background: 'rgba(10,14,23,0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              aria-label="החלף מצלמה"
            >
              <span className="text-lg">🔄</span>
            </button>
            {/* Status overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between text-xs"
              style={{
                background: 'linear-gradient(transparent, rgba(10,14,23,0.9))',
              }}
            >
              <div className="flex items-center gap-1.5">
                {isDetecting && !detectionError && (
                  <span className="live-dot" />
                )}
                <span className="font-medium" style={{ color: detectionError ? '#ef4444' : statusColor }}>
                  {detectionError && !isPersistentError(detectionError) ? 'שגיאה' : statusText}
                </span>
              </div>
              <span className="text-text-tertiary">
                {isDetecting ? 'לחץ להשהיה' : 'לחץ להפעלה'}
              </span>
            </div>
            {/* Coach message overlay on mobile */}
            {latestCoachMsg && (
              <div
                className="absolute top-2 right-2 max-w-[60%] px-3 py-2 rounded-xl text-xs text-gray-200 leading-snug"
                style={{
                  background: 'rgba(10,14,23,0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="font-semibold" style={{ color: '#22D97F' }}>🤖 גל: </span>
                {latestCoachMsg.text}
              </div>
            )}
            {/* Scan line animation when detecting */}
            {isDetecting && !detectionError && (
              <div
                className="absolute left-0 right-0 h-0.5 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, #22D97F, transparent)',
                  animation: 'scanMove 3s ease-in-out infinite',
                }}
              />
            )}
          </div>
        }
        sidebar={
          <div className="flex flex-col gap-4">
            {/* REAL Webcam */}
            <div
              className="rounded-2xl overflow-hidden relative cursor-pointer"
              style={{
                background: '#0a0a0f',
                border: `1px solid ${webcamBorderColor}`,
                boxShadow: `0 4px 16px ${webcamBorderColor}`,
              }}
              onClick={toggleDetection}
            >
              {/* LIVE indicator */}
              {isDetecting && !detectionError && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(10,14,23,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <span className="live-dot" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                </div>
              )}

              {webcamStatus === 'active' || webcamStatus === 'requesting' ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 640, height: 480, facingMode }}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <span className="text-text-tertiary text-sm">{webcamError || 'מצלמה לא פעילה'}</span>
                </div>
              )}
              {/* Camera flip button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
                }}
                className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-transform duration-200 active:scale-90"
                style={{
                  background: 'rgba(10,14,23,0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                aria-label="החלף מצלמה"
              >
                <span className="text-lg">🔄</span>
              </button>
              {/* Status overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center justify-between text-xs"
                style={{
                  background: 'linear-gradient(transparent, rgba(10,14,23,0.9))',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-medium" style={{ color: detectionError ? '#ef4444' : statusColor }}>
                    {detectionError && !isPersistentError(detectionError) ? 'שגיאה' : statusText}
                  </span>
                </div>
                <span className="text-text-tertiary">
                  {isDetecting ? 'לחץ להשהיה' : 'לחץ להפעלה'}
                </span>
              </div>
              {/* Scan line animation when detecting */}
              {isDetecting && !detectionError && (
                <div
                  className="absolute left-0 right-0 h-0.5 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #22D97F, transparent)',
                    animation: 'scanMove 3s ease-in-out infinite',
                  }}
                />
              )}
            </div>

            {/* Detection error — more visible on sidebar */}
            {detectionError && (
              <div
                className="rounded-xl p-3 text-sm cursor-pointer transition-colors"
                style={{
                  background: isPersistentError(detectionError) ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                  border: `1px solid ${isPersistentError(detectionError) ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                  color: isPersistentError(detectionError) ? '#fca5a5' : '#fcd34d',
                }}
                onClick={isPersistentError(detectionError) ? () => setShowApiKey(true) : undefined}
              >
                {getErrorMessage(detectionError)}
              </div>
            )}

            {/* Coach — chat bubble style */}
            <div
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,217,127,0.15), rgba(6,182,212,0.15))',
                    border: '1px solid rgba(34,217,127,0.2)',
                  }}
                >
                  🤖
                </div>
                <span className="text-sm font-bold" style={{ color: '#22D97F' }}>גל</span>
                <span className="text-[10px] text-text-tertiary">מאמן AI</span>
              </div>
              <div
                className="rounded-xl p-3 text-sm text-text-secondary leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                {latestCoachMsg
                  ? latestCoachMsg.text
                  : todayLog.entries.length === 0
                    ? `בוקר טוב ${profile.name}! המצלמה פעילה — תאכל משהו ואני אזהה את זה`
                    : `יום מעולה ${profile.name}! ${todayLog.totalCalories} קלוריות עד עכשיו`
                }
              </div>
            </div>

            {/* Stats — colored numbers */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📊</span>
                <span className="text-sm font-semibold text-text-primary">סטטיסטיקות</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-tertiary">ארוחות היום</span>
                  <span className="text-text-primary font-bold tabular-nums">{todayLog.entries.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-tertiary">XP היום</span>
                  <span className="font-bold tabular-nums" style={{ color: '#f59e0b' }}>+{todayLog.xpEarned}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-tertiary">רמה</span>
                  <span
                    className="font-bold text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}
                  >
                    Lv.{profile.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4 md:gap-5">
          <DailySummary log={todayLog} profile={profile} />
          <HourlyChart data={hourlyData} />
          <FoodLog
            entries={todayLog.entries}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
          />
        </div>
      </MainLayout>

      {/* CSS for animations */}
      <style>{`
        @keyframes scanMove {
          0%, 100% { top: 10%; opacity: 0.5; }
          50% { top: 85%; opacity: 1; }
        }
      `}</style>
    </>
  );
}
