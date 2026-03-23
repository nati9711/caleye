interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  /** 7-element array: true = active, false = inactive for each day of the week */
  weekGrid?: boolean[];
}

export default function StreakCounter({
  currentStreak,
  bestStreak,
  weekGrid = [true, true, true, true, true, false, false],
}: StreakCounterProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      {/* Main streak display */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl streak-fire">🔥</span>
        <div className="flex flex-col items-start">
          <span className="text-3xl font-black text-white">{currentStreak}</span>
          <span className="text-xs text-white/50">ימים ברצף</span>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="flex gap-1.5 mb-3 justify-center" dir="ltr">
        {weekGrid.map((active, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${active
                ? 'bg-emerald-500/30 border border-emerald-400/60 text-emerald-300'
                : 'bg-white/5 border border-white/10 text-white/20'
              }`}
          >
            {active ? '●' : '○'}
          </div>
        ))}
      </div>

      {/* Best streak */}
      <div className="text-xs text-white/40 text-center">
        שיא: 🔥 {bestStreak} ימים
      </div>

      <style>{`
        .streak-fire {
          animation: streak-flicker 0.8s ease-in-out infinite alternate;
          display: inline-block;
        }
        @keyframes streak-flicker {
          0% {
            transform: scale(1) rotate(-3deg);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.1) rotate(2deg);
            filter: brightness(1.3);
          }
          100% {
            transform: scale(1.05) rotate(-1deg);
            filter: brightness(1.1);
          }
        }
      `}</style>
    </div>
  );
}
