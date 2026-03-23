import { useEffect, useState } from 'react';

interface LevelUpOverlayProps {
  level: number;
  levelName: string;
  xpEarned: number;
  onDismiss: () => void;
}

export default function LevelUpOverlay({
  level,
  levelName,
  xpEarned,
  onDismiss,
}: LevelUpOverlayProps) {
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; color: string; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    // Generate confetti pieces
    const colors = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#f59e0b',
      delay: Math.random() * 2,
      size: 6 + Math.random() * 8,
    }));
    setConfettiPieces(pieces);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center levelup-overlay">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center levelup-content">
        <div className="text-6xl mb-4 levelup-emoji">🎉</div>

        <h1 className="text-4xl font-black text-transparent bg-clip-text
          bg-gradient-to-l from-amber-400 via-orange-500 to-red-500 mb-2 levelup-title">
          !LEVEL UP
        </h1>

        <div className="text-7xl font-black text-white/90 mb-2 levelup-number">
          {level}
        </div>

        <div className="text-2xl font-bold text-transparent bg-clip-text
          bg-gradient-to-l from-emerald-400 to-cyan-400 mb-4 levelup-name">
          {levelName}
        </div>

        <div className="text-sm text-white/50 mb-8">
          +{xpEarned} XP היום
        </div>

        <button
          onClick={onDismiss}
          className="px-8 py-3 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600
            text-white font-bold text-lg hover:brightness-110 transition-all
            active:scale-95 levelup-button"
        >
          המשך
        </button>
      </div>

      <style>{`
        .levelup-overlay {
          animation: levelup-fade-in 0.5s ease-out;
        }
        @keyframes levelup-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .levelup-content {
          animation: levelup-scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes levelup-scale-in {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        .levelup-emoji {
          animation: levelup-bounce 0.8s ease-out 0.3s both;
        }
        @keyframes levelup-bounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        .levelup-title {
          animation: levelup-slide-up 0.5s ease-out 0.4s both;
        }
        .levelup-number {
          animation: levelup-slide-up 0.5s ease-out 0.5s both;
        }
        .levelup-name {
          animation: levelup-slide-up 0.5s ease-out 0.6s both;
        }
        .levelup-button {
          animation: levelup-slide-up 0.5s ease-out 0.8s both;
        }
        @keyframes levelup-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .confetti-piece {
          position: absolute;
          border-radius: 2px;
          animation: confetti-fall 3s ease-in infinite;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
