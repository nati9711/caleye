// ============================================================
// CalEye — Zustand App Store
// Single source of truth for all app state.
// Persists to localStorage via zustand/middleware.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  FoodEntry,
  UserProfile,
  CoachMessage,
  NudgeConfig,
  Badge,
  DailyLog,
} from '@/types';
import { LEVELS, BADGES, STORAGE_KEYS } from '@/constants';
import { createEmptyDailyLog, getTodayDate } from '@/lib/storage';

// ============================================================
// Helpers
// ============================================================

/** Generate a unique ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Calculate level from total XP */
function calculateLevel(totalXP: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const level = LEVELS[i];
    if (level && totalXP >= level.totalXP) {
      return level.level;
    }
  }
  return 1;
}

/** Recalculate daily log totals from entries */
function recalculateTotals(entries: FoodEntry[]): Pick<DailyLog, 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'> {
  return entries.reduce(
    (acc, entry) => ({
      totalCalories: acc.totalCalories + entry.calories,
      totalProtein: acc.totalProtein + entry.protein,
      totalCarbs: acc.totalCarbs + entry.carbs,
      totalFat: acc.totalFat + entry.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
  );
}

/** Check all badges against current state and return newly unlocked ones */
function checkBadgeUnlocks(profile: UserProfile, log: DailyLog, currentBadges: string[]): Badge[] {
  const newlyUnlocked: Badge[] = [];

  for (const badge of BADGES) {
    if (currentBadges.includes(badge.id)) continue;
    if (badge.checkUnlock(profile, log)) {
      newlyUnlocked.push(badge);
    }
  }

  return newlyUnlocked;
}

// ============================================================
// Store
// ============================================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────

      profile: null,
      isOnboarded: false,

      isDetecting: false,
      lastDetection: null,
      isPending: false,

      todayLog: createEmptyDailyLog(getTodayDate()),

      coachMessages: [],

      activeToast: null,
      showLevelUp: false,
      showBadgeUnlock: null,

      // ── Actions ────────────────────────────────────────

      addFoodEntry: (entry: FoodEntry) => {
        set((state) => {
          const newEntries = [...state.todayLog.entries, entry];
          const totals = recalculateTotals(newEntries);

          const newLog: DailyLog = {
            ...state.todayLog,
            entries: newEntries,
            ...totals,
          };

          // Track unique foods in profile
          let updatedProfile = state.profile;
          if (updatedProfile && !updatedProfile.uniqueFoodsDetected.includes(entry.food)) {
            updatedProfile = {
              ...updatedProfile,
              uniqueFoodsDetected: [...updatedProfile.uniqueFoodsDetected, entry.food],
            };
          }

          // Check for badge unlocks
          if (updatedProfile) {
            const newBadges = checkBadgeUnlocks(updatedProfile, newLog, updatedProfile.badges);
            if (newBadges.length > 0) {
              const firstBadge = newBadges[0];
              updatedProfile = {
                ...updatedProfile,
                badges: [
                  ...updatedProfile.badges,
                  ...newBadges.map((b) => b.id),
                ],
              };
              return {
                todayLog: newLog,
                lastDetection: entry,
                profile: updatedProfile,
                showBadgeUnlock: firstBadge ?? null,
              };
            }
          }

          return {
            todayLog: newLog,
            lastDetection: entry,
            profile: updatedProfile,
          };
        });
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => {
          if (!state.profile) return state;
          return {
            profile: { ...state.profile, ...updates },
          };
        });
      },

      addXP: (amount: number, _reason: string) => {
        set((state) => {
          if (!state.profile) return state;

          const newTotalXP = state.profile.totalXP + amount;
          const oldLevel = state.profile.level;
          const newLevel = calculateLevel(newTotalXP);
          const didLevelUp = newLevel > oldLevel;

          const updatedProfile: UserProfile = {
            ...state.profile,
            totalXP: newTotalXP,
            level: newLevel,
          };

          const newLog: DailyLog = {
            ...state.todayLog,
            xpEarned: state.todayLog.xpEarned + amount,
          };

          // Check badge unlocks after XP change
          const newBadges = checkBadgeUnlocks(updatedProfile, newLog, updatedProfile.badges);
          if (newBadges.length > 0) {
            const firstBadge = newBadges[0];
            updatedProfile.badges = [
              ...updatedProfile.badges,
              ...newBadges.map((b) => b.id),
            ];
            return {
              profile: updatedProfile,
              todayLog: newLog,
              showLevelUp: didLevelUp,
              showBadgeUnlock: firstBadge ?? null,
            };
          }

          return {
            profile: updatedProfile,
            todayLog: newLog,
            showLevelUp: didLevelUp,
          };
        });
      },

      addCoachMessage: (msg: Omit<CoachMessage, 'id' | 'timestamp'>) => {
        set((state) => ({
          coachMessages: [
            ...state.coachMessages,
            {
              ...msg,
              id: generateId(),
              timestamp: Date.now(),
            },
          ],
        }));
      },

      confirmWorkout: () => {
        set((state) => {
          if (!state.profile) return state;
          return {
            profile: {
              ...state.profile,
              workoutsConfirmed: state.profile.workoutsConfirmed + 1,
            },
          };
        });
      },

      setDetecting: (v: boolean) => {
        set({ isDetecting: v });
      },

      setToast: (toast: NudgeConfig | null) => {
        set({ activeToast: toast });
      },

      resetDay: () => {
        const state = get();
        const today = getTodayDate();

        // If the stored log is from a previous day, reset
        if (state.todayLog.date !== today) {
          // Update streak
          let updatedProfile = state.profile;
          if (updatedProfile) {
            const lastActive = updatedProfile.lastActiveDate;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActive === yesterdayStr) {
              // Continue streak
              const newStreak = updatedProfile.currentStreak + 1;
              updatedProfile = {
                ...updatedProfile,
                currentStreak: newStreak,
                bestStreak: Math.max(newStreak, updatedProfile.bestStreak),
                lastActiveDate: today,
              };
            } else if (lastActive !== today) {
              // Streak broken (unless freeze available)
              if (updatedProfile.streakFreezesUsed < 1) {
                // Auto-apply freeze
                updatedProfile = {
                  ...updatedProfile,
                  streakFreezesUsed: updatedProfile.streakFreezesUsed + 1,
                  lastActiveDate: today,
                };
              } else {
                // Streak reset
                updatedProfile = {
                  ...updatedProfile,
                  currentStreak: 0,
                  lastActiveDate: today,
                  streakFreezesUsed: 0,
                };
              }
            }
          }

          set({
            todayLog: createEmptyDailyLog(today),
            coachMessages: [],
            showLevelUp: false,
            showBadgeUnlock: null,
            activeToast: null,
            profile: updatedProfile,
          });
        }
      },

      unlockBadge: (badgeId: string) => {
        set((state) => {
          if (!state.profile) return state;
          if (state.profile.badges.includes(badgeId)) return state;

          const badge = BADGES.find((b) => b.id === badgeId);
          return {
            profile: {
              ...state.profile,
              badges: [...state.profile.badges, badgeId],
            },
            showBadgeUnlock: badge ?? null,
          };
        });
      },
    }),
    {
      name: STORAGE_KEYS.appState,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        isOnboarded: state.isOnboarded,
        todayLog: state.todayLog,
        coachMessages: state.coachMessages,
      }),
      onRehydrateStorage: () => {
        // After rehydration, check if day has changed
        return (state: AppState | undefined) => {
          if (state) {
            state.resetDay();
          }
        };
      },
    },
  ),
);
