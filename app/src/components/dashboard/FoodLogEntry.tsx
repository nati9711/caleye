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

/** Returns confidence dot color based on percentage */
function getConfidenceDotColor(confidence: number): string {
  if (confidence >= 0.85) return '#22c55e';
  if (confidence >= 0.70) return '#f59e0b';
  return '#ef4444';
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
  // RTL: swipe RIGHT to reveal delete button on the LEFT side
  const deleteOpacity = useTransform(x, [0, 40, 100], [0, 0.5, 1]);
  const deleteBg = useTransform(x, [0, 100], ['transparent', '#ef4444']);

  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Delete button behind — LEFT side (RTL: visually on the right) */}
      <motion.div
        className="absolute inset-y-0 left-0 w-24 flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: deleteBg, opacity: deleteOpacity }}
      >
        <span className="text-white text-xl">🗑️</span>
      </motion.div>

      {/* Swipeable content — RTL: swipe RIGHT to reveal delete */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x > 80) {
            onDelete?.(entry.id);
          }
        }}
        style={{ x }}
        className="glass-card p-4 sm:p-5 cursor-pointer transition-colors duration-200 hover:border-white/[0.12] relative"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Swipe hint — subtle gradient on right edge */}
        <div className="absolute inset-y-0 right-0 w-8 pointer-events-none opacity-30 md:hidden"
          style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.03), transparent)' }}
        />

        {/* Main row */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-bg-elevated overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
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
            {/* Top line: time pill + food name */}
            <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5">
              <span
                className="text-text-tertiary text-[10px] sm:text-xs flex-shrink-0 px-2 py-0.5 rounded-full tabular-nums"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {timeStr}
              </span>
              <span className="text-text-primary font-semibold text-sm sm:text-base truncate">
                {entry.foodHe}
              </span>
            </div>

            {/* Calories — large and accent-colored */}
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-bold text-lg sm:text-xl tabular-nums" style={{ color: '#22D97F' }}>
                {entry.calories}
              </span>
              <span className="text-text-tertiary text-xs">קק״ל</span>
            </div>

            {/* Macros in colored pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="macro-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-macro-protein flex-shrink-0" />
                <span className="text-macro-protein">ח:{entry.protein}g</span>
              </span>
              <span className="macro-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-macro-carbs flex-shrink-0" />
                <span className="text-macro-carbs">פ:{entry.carbs}g</span>
              </span>
              <span className="macro-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-macro-fat flex-shrink-0" />
                <span className="text-macro-fat">ש:{entry.fat}g</span>
              </span>
            </div>
          </div>

          {/* Right side: confidence dot + edit */}
          <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
            {/* Confidence as colored dot with subtle ring */}
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getConfidenceDotColor(entry.confidence),
                  boxShadow: `0 0 6px ${getConfidenceDotColor(entry.confidence)}44`,
                }}
              />
            </div>

            {/* Edit button — larger touch target */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(entry);
              }}
              className="text-text-tertiary hover:text-text-secondary text-sm transition-all duration-200 flex items-center gap-[2px] min-w-[44px] min-h-[44px] justify-center sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-white/[0.04]"
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
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                {/* Larger image */}
                {entry.thumbnail && (
                  <div
                    className="w-full max-w-xs rounded-2xl overflow-hidden mb-4"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <img
                      src={entry.thumbnail}
                      alt={entry.foodHe}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Detailed macro bars */}
                <div className="space-y-2.5 mb-4">
                  <MacroBar label="חלבון" value={entry.protein} color="#3b82f6" max={50} />
                  <MacroBar label="פחמימות" value={entry.carbs} color="#22c55e" max={80} />
                  <MacroBar label="שומן" value={entry.fat} color="#f59e0b" max={40} />
                </div>

                {/* AI reasoning */}
                <div
                  className="text-text-secondary text-sm leading-relaxed rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-text-tertiary">🤖 </span>
                  זיהיתי {entry.foodHe} לפי מאפיינים חזותיים. רמת ביטחון: {Math.round(entry.confidence * 100)}%.
                </div>

                {/* Report as incorrect */}
                <button className="mt-3 text-text-tertiary text-xs hover:text-error transition-colors duration-200">
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
    <div className="flex items-center gap-2.5">
      <span className="text-text-secondary text-xs w-14 text-start">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}33`,
          }}
        />
      </div>
      <span className="text-text-primary text-xs font-medium w-8 text-end tabular-nums">
        {value}g
      </span>
    </div>
  );
}
