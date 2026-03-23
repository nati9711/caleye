import { motion } from 'motion/react';
import type { DailyLog, UserProfile } from '../../types';
import { LEVELS } from '../../store/mockData';
import AnimatedCounter from '../shared/AnimatedCounter';
import ProgressBar from '../shared/ProgressBar';
import MacroRing from './MacroRing';

interface DailySummaryProps {
  /** Today's food log with totals */
  log: DailyLog;
  /** User profile for goal and level info */
  profile: UserProfile;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Main dashboard card at the top.
 * Left side: large animated calorie number with goal text.
 * Right side: macro ring chart (SVG donut).
 * Bottom: progress bar toward daily calorie goal + status text.
 * Below: XP earned today + streak counter + level progress bar.
 * Glassmorphism card style, animated fade-in on mount.
 */
export default function DailySummary({ log, profile, className = '' }: DailySummaryProps) {
  const goalPct = Math.min(
    Math.round((log.totalCalories / profile.calorieGoal) * 100),
    100
  );
  const remaining = Math.max(0, profile.calorieGoal - log.totalCalories);

  // Level progress calculation
  const currentLevel = LEVELS.find((l) => l.level === profile.level) ?? LEVELS[0]!;
  const nextLevel = LEVELS.find((l) => l.level === profile.level + 1);
  const xpIntoLevel = profile.totalXP - (currentLevel?.totalXP ?? 0);
  const xpForNextLevel = nextLevel
    ? nextLevel.totalXP - (currentLevel?.totalXP ?? 0)
    : (currentLevel?.xpRequired ?? 1);
  const levelPct = Math.round((xpIntoLevel / xpForNextLevel) * 100);

  // Macro targets in grams (derived from calorie goal and macro split percentages)
  const macroTargets = {
    protein: Math.round((profile.calorieGoal * (profile.macroSplit.protein / 100)) / 4),
    carbs: Math.round((profile.calorieGoal * (profile.macroSplit.carbs / 100)) / 4),
    fat: Math.round((profile.calorieGoal * (profile.macroSplit.fat / 100)) / 9),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card-premium p-5 sm:p-6 ${className}`}
    >
      {/* Top row: Calories + Macro ring — stacks vertically on mobile */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-5 sm:gap-6">
        {/* Calories block — full width on mobile */}
        <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
          {log.totalCalories === 0 ? (
            <div className="flex flex-col items-center sm:items-start gap-2">
              <span className="text-3xl sm:text-4xl">👁️</span>
              <span className="text-text-secondary text-sm">
                המצלמה פעילה — תאכל משהו ואני אזהה!
              </span>
            </div>
          ) : (
            <>
              <AnimatedCounter
                value={log.totalCalories}
                className="text-[36px] sm:text-[44px] font-bold leading-none font-sora gradient-text-glow"
              />
              <div className="text-text-secondary text-sm mt-1">
                <span className="text-text-tertiary">מתוך </span>
                <span className="text-text-primary font-semibold">
                  {profile.calorieGoal.toLocaleString('he-IL')}
                </span>
                <span className="text-text-tertiary"> קק״ל</span>
              </div>
            </>
          )}
        </div>

        {/* Macro ring — full width centered on mobile */}
        <MacroRing
          protein={log.totalProtein}
          carbs={log.totalCarbs}
          fat={log.totalFat}
          targets={macroTargets}
          size={140}
          className="flex-shrink-0"
        />
      </div>

      {/* Progress bar toward daily goal */}
      <div className="mt-5 sm:mt-6">
        <ProgressBar value={goalPct} height={10} glow />
        <div className="flex items-center justify-between mt-2">
          <span className="text-text-tertiary text-xs">
            {goalPct}% מהיעד
          </span>
          <span className="text-text-tertiary text-xs">
            נשארו{' '}
            <span className="text-text-primary font-semibold">
              {remaining.toLocaleString('he-IL')}
            </span>{' '}
            קק״ל
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] my-4" />

      {/* Bottom row: XP + Streak + Level */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* XP earned today — warm pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}
        >
          <span className="text-accent-warm text-sm leading-none">⭐</span>
          <span className="text-accent-warm font-bold text-sm tabular-nums">
            +{log.xpEarned} XP
          </span>
          <span className="text-accent-warm/60 text-xs">היום</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <span
            className="animate-fire-pulse inline-block text-lg leading-none"
            style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))' }}
          >
            🔥
          </span>
          <span className="text-text-primary font-bold text-sm tabular-nums">
            {profile.currentStreak}
          </span>
          <span className="text-text-tertiary text-xs">ימים ברצף</span>
        </div>
      </div>

      {/* Level progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-text-tertiary text-xs">
            Level {profile.level}: &quot;{currentLevel?.name}&quot;
          </span>
          <span className="text-text-tertiary text-[10px] tabular-nums">{levelPct}%</span>
        </div>
        <ProgressBar value={levelPct} height={5} />
      </div>
    </motion.div>
  );
}
