interface LevelBadgeProps {
  level: number;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function getLevelGlowColor(level: number): string {
  if (level >= 14) return '#ef4444'; // legendary red
  if (level >= 11) return '#eab308'; // epic gold
  if (level >= 8)  return '#a855f7'; // rare purple
  if (level >= 5)  return '#3b82f6'; // uncommon blue
  return '#22c55e';                  // common green
}

const SIZE_MAP = {
  sm: { circle: 'w-12 h-12', text: 'text-lg', label: 'text-[10px]' },
  md: { circle: 'w-16 h-16', text: 'text-2xl', label: 'text-xs' },
  lg: { circle: 'w-20 h-20', text: 'text-3xl', label: 'text-sm' },
};

export default function LevelBadge({ level, name, size = 'md' }: LevelBadgeProps) {
  const glowColor = getLevelGlowColor(level);
  const s = SIZE_MAP[size];

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Circular badge */}
      <div
        className={`${s.circle} rounded-full flex items-center justify-center
          bg-white/5 backdrop-blur-xl border-2 level-badge-glow`}
        style={{
          borderColor: glowColor,
          boxShadow: `0 0 12px ${glowColor}40, 0 0 24px ${glowColor}20`,
        }}
      >
        <span className={`${s.text} font-black text-white`}>
          {level}
        </span>
      </div>

      {/* Level name */}
      <span className={`${s.label} text-white/60 text-center leading-tight`}>
        {name}
      </span>

      <style>{`
        .level-badge-glow {
          animation: level-pulse 3s ease-in-out infinite;
        }
        @keyframes level-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }
      `}</style>
    </div>
  );
}
