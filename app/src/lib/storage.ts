// ============================================================
// CalEye — localStorage Helpers
// All persistence logic is centralized here.
// ============================================================

import type { DailyLog, UserProfile } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// ============================================================
// Date utilities
// ============================================================

/** Get today's date as YYYY-MM-DD */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Create an empty DailyLog for a given date */
export function createEmptyDailyLog(date: string): DailyLog {
  return {
    date,
    entries: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    xpEarned: 0,
  };
}

// ============================================================
// Profile
// ============================================================

/** Load user profile from localStorage */
export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/** Save user profile to localStorage */
export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

// ============================================================
// Daily Log
// ============================================================

/** Load today's log from localStorage (creates empty if missing or stale) */
export function loadTodayLog(): DailyLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.todayLog);
    if (!raw) return createEmptyDailyLog(getTodayDate());

    const log = JSON.parse(raw) as DailyLog;

    // If the stored log is from a different day, archive it and return fresh
    if (log.date !== getTodayDate()) {
      archiveDailyLog(log);
      return createEmptyDailyLog(getTodayDate());
    }

    return log;
  } catch {
    return createEmptyDailyLog(getTodayDate());
  }
}

/** Save today's log to localStorage */
export function saveTodayLog(log: DailyLog): void {
  localStorage.setItem(STORAGE_KEYS.todayLog, JSON.stringify(log));
}

// ============================================================
// History (last 30 days)
// ============================================================

/** Load history logs (up to 30 days) */
export function loadHistory(): DailyLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (!raw) return [];
    return JSON.parse(raw) as DailyLog[];
  } catch {
    return [];
  }
}

/** Archive a completed daily log into history */
export function archiveDailyLog(log: DailyLog): void {
  const history = loadHistory();

  // Don't duplicate if same date already archived
  const existingIndex = history.findIndex((h) => h.date === log.date);
  if (existingIndex >= 0) {
    history[existingIndex] = log;
  } else {
    history.push(log);
  }

  // Sort descending by date
  history.sort((a, b) => b.date.localeCompare(a.date));

  // Keep only last 30 days
  const trimmed = history.slice(0, 30);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(trimmed));
}

/** Get a specific day's log from history */
export function getHistoryLog(date: string): DailyLog | null {
  const history = loadHistory();
  return history.find((h) => h.date === date) ?? null;
}

// ============================================================
// Onboarding state
// ============================================================

/** Check if user has completed onboarding */
export function isOnboarded(): boolean {
  return localStorage.getItem(STORAGE_KEYS.onboarded) === 'true';
}

/** Mark onboarding as completed */
export function setOnboarded(): void {
  localStorage.setItem(STORAGE_KEYS.onboarded, 'true');
}

// ============================================================
// Cleanup
// ============================================================

/** Clear old data beyond 30-day retention */
export function clearOldData(): void {
  const history = loadHistory();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  if (!cutoffDate) return;

  const filtered = history.filter((h) => h.date >= cutoffDate);

  if (filtered.length !== history.length) {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(filtered));
  }
}

/** Clear all CalEye data (for debugging / reset) */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
