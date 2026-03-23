import { useState } from 'react';
import type { WorkoutSuggestion } from '../../types';

interface WorkoutCardProps {
  suggestion: WorkoutSuggestion;
  onConfirm: () => void;
  onLater: () => void;
  onDismiss: () => void;
}

export default function WorkoutCard({
  suggestion,
  onConfirm,
  onLater,
  onDismiss,
}: WorkoutCardProps) {
  const [action, setAction] = useState<'confirmed' | 'later' | 'dismissed' | null>(null);

  function handleConfirm() {
    setAction('confirmed');
    setTimeout(onConfirm, 400);
  }

  function handleLater() {
    setAction('later');
    setTimeout(onLater, 400);
  }

  function handleDismiss() {
    setAction('dismissed');
    setTimeout(onDismiss, 400);
  }

  const waitText = suggestion.waitMinutes >= 60
    ? `${Math.floor(suggestion.waitMinutes / 60)} שעות`
    : `${suggestion.waitMinutes} דקות`;

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5
        workout-card-enter ${action ? 'workout-card-exit' : ''}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏋️</span>
        <span className="text-sm font-bold text-white/70">המלצת אימון</span>
      </div>

      {/* Reason */}
      <p className="text-xs text-white/40 mb-4">{suggestion.reason}</p>

      {/* Workout details */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{suggestion.emoji}</span>
          <div>
            <div className="text-lg font-bold text-white">
              {suggestion.typeHe}
            </div>
            <div className="text-sm text-white/50">
              {suggestion.duration}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5 text-orange-400">
            <span>🔥</span>
            <span>~{suggestion.caloriesBurn} קק"ל ישרפו</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span>⏰</span>
            <span>מומלץ בעוד {waitText}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30
            text-emerald-400 text-sm font-bold
            hover:bg-emerald-500/30 active:scale-95 transition-all"
        >
          עשיתי! ✅
        </button>
        <button
          onClick={handleLater}
          className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30
            text-amber-400 text-sm font-bold
            hover:bg-amber-500/30 active:scale-95 transition-all"
        >
          אח"כ ⏰
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30
            text-red-400 text-sm font-bold
            hover:bg-red-500/30 active:scale-95 transition-all"
        >
          דלג ❌
        </button>
      </div>

      <style>{`
        .workout-card-enter {
          animation: workout-slide-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes workout-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .workout-card-exit {
          animation: workout-slide-out 0.4s ease-in forwards;
        }
        @keyframes workout-slide-out {
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
