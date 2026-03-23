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
    <header className="glass-header fixed top-0 inset-x-0 z-50 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-lg">
      {/* Right side (RTL: logo + brand) */}
      <div className="flex items-center gap-xs sm:gap-sm">
        {/* Logo */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gradient-fill flex items-center justify-center">
          <span className="text-bg-deep font-bold text-base sm:text-lg leading-none">C</span>
        </div>

        {/* Brand name — hidden on mobile */}
        <h1 className="font-sora font-bold text-xl gradient-text hidden sm:block">
          CalEye
        </h1>
      </div>

      {/* Center: Streak + Level — compact on mobile */}
      <div className="flex items-center gap-sm sm:gap-lg">
        {/* Streak counter */}
        <div className="flex items-center gap-xs">
          <span className="animate-fire-pulse inline-block text-lg sm:text-xl leading-none">
            🔥
          </span>
          <span className="font-bold text-text-primary text-body-sm sm:text-body">
            {profile.currentStreak}
          </span>
          <span className="text-text-secondary text-body-sm hidden sm:inline">
            ברצף
          </span>
        </div>

        {/* Level badge */}
        <div className="flex items-center gap-xs">
          <span className="text-accent-warm text-base sm:text-lg leading-none">⭐</span>
          <span className="text-text-primary font-semibold text-caption sm:text-body-sm">
            Lv{profile.level}
          </span>
          <span className="text-text-secondary text-body-sm hidden md:inline">
            &quot;{levelInfo?.name}&quot;
          </span>
        </div>
      </div>

      {/* Left side (RTL): Name + Settings */}
      <div className="flex items-center gap-sm sm:gap-md">
        {/* User name — hidden on mobile */}
        <span className="text-text-secondary text-body-sm hidden sm:block">
          {profile.name}
        </span>

        {/* Settings gear — 44px touch target */}
        <button
          onClick={onSettingsClick}
          className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center
            text-text-secondary hover:text-text-primary hover:bg-bg-elevated
            transition-colors duration-200"
          aria-label="הגדרות"
        >
          <svg
            width="20"
            height="20"
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
