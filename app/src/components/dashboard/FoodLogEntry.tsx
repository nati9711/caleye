import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import type { FoodEntry } from '../../types';

interface FoodLogEntryProps {
  /** The food entry data */
  entry: FoodEntry;
  /** Stagger index for slide-in animation delay */
  index?: number;
  /** Callback when edit button is clicked */
  onEdit?: (entry: FoodEntry) => void;
  /** Callback when entry is swiped to delete */
  onDelete?: (entryId: string) => void;
}

/** Returns confidence badge color class based on percentage */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return 'text-success';
  if (confidence >= 0.70) return 'text-accent-warm';
  return 'text-error';
}

/** Returns confidence badge background class */
function getConfidenceBg(confidence: number): string {
  if (confidence >= 0.85) return 'bg-success/10';
  if (confidence >= 0.70) return 'bg-accent-warm/10';
  return 'bg-error/10';
}

/**
 * Individual food log entry card.
 * Shows thumbnail (64x64), timestamp, food name (Hebrew), calories,
 * macro breakdown (protein/carbs/fat), confidence badge, and edit button.
 * Tap/click to expand: shows larger image + AI reasoning text.
 * Glassmorphism card with slide-in animation on mount.
 */
export default function FoodLogEntry({ entry, index = 0, onEdit, onDelete }: FoodLogEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -40, 0], [1, 0.5, 0]);
  const deleteBg = useTransform(x, [-100, 0], ['#ef4444', 'transparent']);

  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const confidencePct = Math.round(entry.confidence * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Delete button behind (revealed on swipe) */}
      <motion.div
        className="absolute inset-y-0 left-0 w-24 flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: deleteBg, opacity: deleteOpacity }}
      >
        <span className="text-white text-xl">🗑️</span>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            onDelete?.(entry.id);
          }
        }}
        style={{ x }}
        className="glass-card p-3 sm:p-md cursor-pointer transition-colors duration-200 hover:border-white/[0.15] relative"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Main row */}
        <div className="flex items-start gap-sm sm:gap-md">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-thumb bg-bg-elevated overflow-hidden">
            {entry.thumbnail ? (
              <img
                src={entry.thumbnail}
                alt={entry.foodHe}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                🍽️
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Top line: time + food name */}
            <div className="flex items-baseline gap-xs sm:gap-sm mb-xs">
              <span className="text-text-tertiary text-caption sm:text-body-sm flex-shrink-0">
                {timeStr}
              </span>
              <span className="text-text-primary font-semibold text-body-sm sm:text-body truncate">
                {entry.foodHe}
              </span>
            </div>

            {/* Calories + macros on mobile in one row */}
            <div className="flex items-baseline gap-sm flex-wrap">
              <div className="mb-0">
                <span className="text-accent font-bold text-body sm:text-h3">
                  {entry.calories}
                </span>
                <span className="text-text-secondary text-caption sm:text-body-sm mr-1">קק״ל</span>
              </div>

              {/* Macros row */}
              <div className="flex items-center gap-xs sm:gap-sm text-caption sm:text-body-sm">
                <span className="text-macro-protein">
                  ח: {entry.protein}g
                </span>
                <span className="text-text-tertiary">|</span>
                <span className="text-macro-carbs">
                  פ: {entry.carbs}g
                </span>
                <span className="text-text-tertiary">|</span>
                <span className="text-macro-fat">
                  ש: {entry.fat}g
                </span>
              </div>
            </div>
          </div>

          {/* Right side: confidence + edit */}
          <div className="flex flex-col items-end gap-xs sm:gap-sm flex-shrink-0">
            {/* Confidence badge */}
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-caption font-medium ${getConfidenceColor(entry.confidence)} ${getConfidenceBg(entry.confidence)}`}
            >
              {confidencePct}%
            </span>

            {/* Edit button — larger touch target */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(entry);
              }}
              className="text-text-tertiary hover:text-text-secondary text-body-sm transition-colors duration-200 flex items-center gap-[2px] min-w-[44px] min-h-[44px] justify-center sm:min-w-0 sm:min-h-0"
              aria-label="תקן זיהוי"
            >
              ✏️ <span className="text-caption hidden sm:inline">תקן</span>
            </button>
          </div>
        </div>

        {/* Expanded section with layout animation */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-md pt-md border-t border-white/[0.06]">
                {/* Larger image */}
                {entry.thumbnail && (
                  <div className="w-full max-w-xs rounded-card overflow-hidden mb-md">
                    <img
                      src={entry.thumbnail}
                      alt={entry.foodHe}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Detailed macro bars */}
                <div className="space-y-sm mb-md">
                  <MacroBar label="חלבון" value={entry.protein} color="#3b82f6" max={50} />
                  <MacroBar label="פחמימות" value={entry.carbs} color="#22c55e" max={80} />
                  <MacroBar label="שומן" value={entry.fat} color="#f59e0b" max={40} />
                </div>

                {/* AI reasoning */}
                <div className="text-text-secondary text-body-sm leading-relaxed">
                  <span className="text-text-tertiary">🤖 </span>
                  זיהיתי {entry.foodHe} לפי מאפיינים חזותיים. רמת ביטחון: {confidencePct}%.
                </div>

                {/* Report as incorrect */}
                <button className="mt-sm text-text-tertiary text-caption hover:text-error transition-colors duration-200">
                  דווח כשגוי
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Mini macro bar for expanded view ─────────────────────────────────

interface MacroBarProps {
  label: string;
  value: number;
  color: string;
  max: number;
}

function MacroBar({ label, value, color, max }: MacroBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-sm">
      <span className="text-text-secondary text-caption w-14 text-start">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-text-primary text-caption font-medium w-8 text-end">
        {value}g
      </span>
    </div>
  );
}
