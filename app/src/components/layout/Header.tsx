import type { UserProfile } from '../../types';
import { LEVELS } from '../../store/mockData';

interface HeaderProps {
  /** User profile data for streak, level, and name display */
  profile: UserProfile;
  /** Callback when settings gear is clicked */
  onSettingsClick?: () => void;
}

/**
 * Fixed top header with glassmorphism background.
 * Displays logo, streak counter with animated flame, level badge,
 * user name, and settings icon. RTL layout.
 * Mobile: hides text labels, shows only icons + numbers.
 */
export default function Header({ profile, onSettingsClick }: HeaderProps) {
  const levelInfo = LEVELS.find((l) => l.level === profile.level) ?? LEVELS[0];

  return (
    <header className="glass-header fixed top-0 inset-x-0 z-50 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-5">
      {/* Right side (RTL: logo + brand) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo with subtle glow */}
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #22D97F, #06B6D4)',
            boxShadow: '0 0 16px rgba(34, 217, 127, 0.25)',
          }}
        >
          <span className="text-[#0A0E17] font-bold text-lg sm:text-xl leading-none font-sora">C</span>
        </div>

        {/* Brand name — hidden on mobile */}
        <h1 className="font-sora font-bold text-xl gradient-text-glow hidden sm:block tracking-tight">
          CalEye
        </h1>
      </div>

      {/* Center: Streak + Level — compact on mobile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Streak counter with warm glow */}
        <div className="flex items-center gap-1.5">
          <span
            className="animate-fire-pulse inline-block text-xl sm:text-2xl leading-none"
            style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))' }}
          >
            🔥
          </span>
          <span className="font-bold text-text-primary text-sm sm:text-base tabular-nums">
            {profile.currentStreak}
          </span>
          <span className="text-text-tertiary text-xs hidden sm:inline">
            ברצף
          </span>
        </div>

        {/* Level badge — styled like a real badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          <span className="text-accent-warm text-sm sm:text-base leading-none">⭐</span>
          <span className="text-accent-warm font-semibold text-xs sm:text-sm">
            Lv{profile.level}
          </span>
          <span className="text-text-secondary text-xs hidden md:inline">
            {levelInfo?.name}
          </span>
        </div>
      </div>

      {/* Left side (RTL): Name + Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User name — hidden on mobile */}
        <span className="text-text-tertiary text-sm hidden sm:block">
          {profile.name}
        </span>

        {/* Settings gear — 44px touch target with hover ring */}
        <button
          onClick={onSettingsClick}
          className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center
            text-text-tertiary hover:text-text-primary
            hover:bg-white/[0.06] hover:ring-1 hover:ring-white/[0.1]
            transition-all duration-200"
          aria-label="הגדרות"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
