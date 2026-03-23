import { useState, useCallback, useMemo } from 'react';
import Webcam from 'react-webcam';
import { useWebcam } from '../../hooks/useWebcam';
import { useFoodDetection } from '../../hooks/useFoodDetection';
import { getApiKey } from '../../lib/gemini';
import Header from '../layout/Header';
import MainLayout from '../layout/MainLayout';
import DailySummary from './DailySummary';
import HourlyChart from './HourlyChart';
import FoodLog from './FoodLog';
import type { FoodEntry, DailyLog, UserProfile, CoachMessage } from '../../types';

type FacingMode = 'user' | 'environment';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyLog(): DailyLog {
  return {
    date: getTodayDate(),
    entries: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    xpEarned: 0,
  };
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

// ── Toast Component (inline, simple) ─────────────────────────────────────────

function FoodToast({ entry, onClose }: { entry: FoodEntry; onClose: () => void }) {
  return (
    <div
      className="fixed top-20 left-3 right-3 sm:left-4 sm:right-auto z-50 p-3 sm:p-4 rounded-2xl border max-w-sm animate-toast-slide-in"
      style={{
        background: 'rgba(26,26,46,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(34,217,127,0.3)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold text-white mb-1 truncate">
            🍽️ {entry.foodHe}
          </div>
          <div className="text-xl sm:text-2xl font-bold" style={{ color: '#22D97F' }}>
            {entry.calories} <span className="text-sm text-gray-400">קק״ל</span>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>ח: {entry.protein}g</span>
            <span>פ: {entry.carbs}g</span>
            <span>ש: {entry.fat}g</span>
          </div>
          <div className="text-xs mt-1" style={{ color: entry.confidence > 0.85 ? '#22c55e' : '#f59e0b' }}>
            ביטחון: {Math.round(entry.confidence * 100)}%
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">×</button>
      </div>
    </div>
  );
}

// ── API Key Modal (inline, simple) ──────────────────────────────────────────

function ApiKeyModal({ onSave, onClose }: { onSave: (key: string) => void; onClose: () => void }) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="p-6 rounded-2xl max-w-md w-full" style={{ background: '#1a1a2e', border: '1px solid rgba(57,255,20,0.2)' }}>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">👁️</div>
          <h2 className="text-xl font-bold text-white">CalEye</h2>
          <p className="text-sm text-gray-400 mt-1">חיבור ל-AI Vision</p>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🔗</span>
            <span className="text-sm font-bold text-white">OpenRouter API Key</span>
          </div>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
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
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-..."
              className="w-full p-3 pr-10 rounded-lg text-white text-sm font-mono"
              style={{ background: '#0a0e17', border: '1px solid rgba(255,255,255,0.1)' }}
              onKeyDown={(e) => e.key === 'Enter' && key.trim() && onSave(key.trim())}
              dir="ltr"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => key.trim() && onSave(key.trim())}
            disabled={!key.trim()}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: key.trim() ? '#22D97F' : 'rgba(34,217,127,0.2)',
              color: key.trim() ? '#0a0e17' : 'rgba(255,255,255,0.3)',
            }}
          >
            🚀 התחל לעקוב
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-gray-400 hover:text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            ✕
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-3">
          🔒 המפתח נשמר ב-localStorage בלבד
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  // State
  const [todayLog, setTodayLog] = useState<DailyLog>(createEmptyLog);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [toast, setToast] = useState<FoodEntry | null>(null);
  const [showApiKey, setShowApiKey] = useState(!getApiKey());
  const [coachMsg, setCoachMsg] = useState<CoachMessage | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');

  // Webcam
  const { webcamRef, status: webcamStatus, isReady, capture, error: webcamError } = useWebcam();

  // Food detection callbacks
  const onFoodDetected = useCallback((entry: FoodEntry) => {
    setTodayLog((prev) => {
      const entries = [entry, ...prev.entries];
      return {
        ...prev,
        entries,
        totalCalories: prev.totalCalories + entry.calories,
        totalProtein: prev.totalProtein + entry.protein,
        totalCarbs: prev.totalCarbs + entry.carbs,
        totalFat: prev.totalFat + entry.fat,
      };
    });

    // Coach message
    const isHealthy = entry.calories < 400;
    setCoachMsg({
      id: entry.id,
      text: isHealthy
        ? `מעולה! ${entry.foodHe} — בחירה טובה. +5 XP 💚`
        : `${entry.foodHe}? מבין אותך! מה דעתך על הליכה קטנה אחר כך? 😉`,
      timestamp: Date.now(),
      category: isHealthy ? 'healthy_meal' : 'unhealthy_meal',
    });
  }, []);

  const onToast = useCallback((entry: FoodEntry) => {
    setToast(entry);
    setTimeout(() => setToast(null), 5000);
  }, []);

  const onXpAwarded = useCallback((xp: number) => {
    setProfile((prev) => ({ ...prev, totalXP: prev.totalXP + xp, xpEarned: (prev.totalXP || 0) + xp }));
    setTodayLog((prev) => ({ ...prev, xpEarned: prev.xpEarned + xp }));
  }, []);

  // Detection hook
  const { isDetecting, isPending, toggleDetection, error: detectionError } = useFoodDetection({
    captureFrame: capture,
    onFoodDetected,
    onToast,
    onXpAwarded,
    isWebcamReady: isReady,
  });

  // Hourly data
  const hourlyData = useMemo(() => buildHourlyData(todayLog.entries), [todayLog.entries]);

  // API key save
  const handleApiKeySave = (key: string) => {
    localStorage.setItem('caleye_gemini_api_key', key);
    setShowApiKey(false);
  };

  // Status text
  const statusText = isPending ? '🔄 מנתח...' : isDetecting ? '👁️ מחפש...' : '⏸️ מושהה';
  const statusColor = isPending ? '#f59e0b' : isDetecting ? '#22D97F' : '#6b7280';

  return (
    <>
      <Header profile={profile} onSettingsClick={() => setShowApiKey(true)} />

      {/* Toast */}
      {toast && <FoodToast entry={toast} onClose={() => setToast(null)} />}

      {/* API Key Modal */}
      {showApiKey && <ApiKeyModal onSave={handleApiKeySave} onClose={() => setShowApiKey(false)} />}

      <MainLayout
        mobileTopCard={
          /* Compact 16:9 webcam card for mobile — shown inline above dashboard */
          <div
            className="rounded-2xl overflow-hidden relative border cursor-pointer aspect-video"
            style={{ background: '#0a0a0f', borderColor: `${statusColor}40` }}
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
                <span className="text-gray-500 text-sm">{webcamError || 'מצלמה לא פעילה'}</span>
              </div>
            )}
            {/* Camera flip button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
              }}
              className="absolute top-2 left-2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform duration-200 active:scale-90"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              aria-label="החלף מצלמה"
            >
              <span className="text-lg">🔄</span>
            </button>
            {/* Status overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between text-xs font-mono"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <span style={{ color: statusColor }}>{statusText}</span>
              <span className="text-gray-500">
                {isDetecting ? 'לחץ להשהיה' : 'לחץ להפעלה'}
              </span>
            </div>
            {/* Coach message overlay on mobile */}
            {coachMsg && (
              <div
                className="absolute top-2 right-2 max-w-[60%] px-3 py-1.5 rounded-xl text-xs text-gray-200 leading-snug"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              >
                <span style={{ color: '#22D97F' }}>🤖 גל: </span>
                {coachMsg.text}
              </div>
            )}
            {/* Scan line animation when detecting */}
            {isDetecting && (
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
              className="rounded-2xl overflow-hidden relative border cursor-pointer"
              style={{ background: '#0a0a0f', borderColor: `${statusColor}40` }}
              onClick={toggleDetection}
            >
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
                  <span className="text-gray-500 text-sm">{webcamError || 'מצלמה לא פעילה'}</span>
                </div>
              )}
              {/* Camera flip button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
                }}
                className="absolute top-2 left-2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform duration-200 active:scale-90"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                aria-label="החלף מצלמה"
              >
                <span className="text-lg">🔄</span>
              </button>
              {/* Status overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between text-xs font-mono"
                style={{ background: 'rgba(0,0,0,0.7)' }}
              >
                <span style={{ color: statusColor }}>{statusText}</span>
                <span className="text-gray-500">
                  {isDetecting ? 'לחץ להשהיה' : 'לחץ להפעלה'}
                </span>
              </div>
              {/* Scan line animation when detecting */}
              {isDetecting && (
                <div
                  className="absolute left-0 right-0 h-0.5 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #22D97F, transparent)',
                    animation: 'scanMove 3s ease-in-out infinite',
                  }}
                />
              )}
            </div>

            {/* Detection error */}
            {detectionError && (
              <div className="text-xs text-red-400 px-2">{detectionError}</div>
            )}

            {/* Coach */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(26,26,46,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span>
                <span className="text-sm font-bold" style={{ color: '#22D97F' }}>גל</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {coachMsg
                  ? coachMsg.text
                  : todayLog.entries.length === 0
                    ? `בוקר טוב ${profile.name}! המצלמה פעילה — תאכל משהו ואני אזהה את זה 😎`
                    : `יום מעולה ${profile.name}! ${todayLog.totalCalories} קלוריות עד עכשיו 💪`
                }
              </p>
            </div>

            {/* Stats */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(26,26,46,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-sm text-gray-400 mb-2">סטטיסטיקות</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ארוחות היום</span>
                <span className="text-white font-bold">{todayLog.entries.length}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">XP היום</span>
                <span className="font-bold" style={{ color: '#f59e0b' }}>+{todayLog.xpEarned}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">רמה</span>
                <span className="text-white font-bold">טירון (Lv.{profile.level})</span>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-3 md:gap-4">
          <DailySummary log={todayLog} profile={profile} />
          <HourlyChart data={hourlyData} />
          <FoodLog
            entries={todayLog.entries}
            onEditEntry={(entry) => console.log('Edit:', entry.id)}
          />
        </div>
      </MainLayout>

      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scanMove {
          0%, 100% { top: 10%; opacity: 0.5; }
          50% { top: 85%; opacity: 1; }
        }
      `}</style>
    </>
  );
}
