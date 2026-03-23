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
    <div className={`glass-card p-lg animate-fade-in-scale ${className}`}>
      {/* Top row: Calories + Macro ring */}
      <div className="flex items-center justify-between gap-lg flex-wrap">
        {/* Calories block */}
        <div className="flex flex-col items-start gap-xs">
          <AnimatedCounter
            value={log.totalCalories}
            className="text-[32px] font-bold text-accent leading-none"
          />
          <span className="text-text-secondary text-body-sm">
            קק״ל מתוך {profile.calorieGoal.toLocaleString('he-IL')}
          </span>
        </div>

        {/* Macro ring */}
        <MacroRing
          protein={log.totalProtein}
          carbs={log.totalCarbs}
          fat={log.totalFat}
          targets={macroTargets}
          size={130}
          className="flex-shrink-0"
        />
      </div>

      {/* Progress bar toward daily goal */}
      <div className="mt-lg">
        <ProgressBar value={goalPct} height={10} />
        <div className="flex items-center justify-between mt-xs">
          <span className="text-text-secondary text-body-sm">
            {goalPct}% מהיעד
          </span>
          <span className="text-text-secondary text-body-sm">
            נשארו{' '}
            <span className="text-text-primary font-semibold">
              {remaining.toLocaleString('he-IL')}
            </span>{' '}
            קק״ל
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] my-md" />

      {/* Bottom row: XP + Streak + Level */}
      <div className="flex items-center justify-between flex-wrap gap-sm">
        {/* XP earned today */}
        <div className="flex items-center gap-xs">
          <span className="text-accent-warm text-lg leading-none">⭐</span>
          <span className="text-text-primary font-semibold text-body">
            +{log.xpEarned} XP
          </span>
          <span className="text-text-tertiary text-body-sm">היום</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-xs">
          <span className="animate-fire-pulse inline-block text-lg leading-none">🔥</span>
          <span className="text-text-primary font-semibold text-body">
            {profile.currentStreak}
          </span>
          <span className="text-text-tertiary text-body-sm">ימים ברצף</span>
        </div>
      </div>

      {/* Level progress */}
      <div className="mt-sm">
        <div className="flex items-center justify-between mb-xs">
          <span className="text-text-secondary text-body-sm">
            Level {profile.level}: &quot;{currentLevel?.name}&quot;
          </span>
          <span className="text-text-tertiary text-caption">{levelPct}%</span>
        </div>
        <ProgressBar value={levelPct} height={6} />
      </div>
    </div>
  );
}
