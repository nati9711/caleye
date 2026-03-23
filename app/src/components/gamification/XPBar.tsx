import { useEffect, useState } from 'react';
import { getXPProgress, getLevelForXP } from '../../lib/xp';

interface XPBarProps {
  totalXP: number;
}

export default function XPBar({ totalXP }: XPBarProps) {
  const level = getLevelForXP(totalXP);
  const progress = getXPProgress(totalXP);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    // Animate the bar fill on XP change
    const timeout = setTimeout(() => {
      setAnimatedWidth(progress.percentage);
    }, 100);
    return () => clearTimeout(timeout);
  }, [progress.percentage]);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      {/* Level label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-400">Lv.{level.level}</span>
          <span className="text-sm text-white/70">{level.name}</span>
        </div>
        <span className="text-xs text-white/50">
          {progress.needed > 0
            ? `${progress.current}/${progress.needed} XP`
            : 'MAX LEVEL'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 right-0 rounded-full xp-bar-fill"
          style={{
            width: `${animatedWidth}%`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* Shimmer effect */}
        <div
          className="absolute inset-y-0 right-0 rounded-full xp-bar-shimmer"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>

      <style>{`
        .xp-bar-fill {
          background: linear-gradient(90deg, #f59e0b, #f97316, #ef4444);
        }
        .xp-bar-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: xp-shimmer 2s infinite;
        }
        @keyframes xp-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
