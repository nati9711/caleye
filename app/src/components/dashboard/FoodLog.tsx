import { AnimatePresence } from 'motion/react';
import type { FoodEntry } from '../../types';
import FoodLogEntry from './FoodLogEntry';

interface FoodLogProps {
  /** Array of food entries to display (will be sorted newest first) */
  entries: FoodEntry[];
  /** Callback when edit button is clicked on an entry */
  onEditEntry?: (entry: FoodEntry) => void;
  /** Callback when an entry is swiped to delete */
  onDeleteEntry?: (entryId: string) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Vertical scrollable food log list.
 * Displays entries newest first. Shows an empty state when no entries exist.
 * Each entry is a FoodLogEntry component with staggered slide-in animation.
 * Max height with internal scroll on desktop.
 */
export default function FoodLog({ entries, onEditEntry, onDeleteEntry, className = '' }: FoodLogProps) {
  // Sort by timestamp descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={`${className}`}>
      {/* Section title */}
      <h3 className="text-h3 text-text-primary mb-md">יומן אוכל</h3>

      {/* Entry list or empty state */}
      {sortedEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2 sm:space-y-sm max-h-[500px] md:max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
          <AnimatePresence initial={false}>
            {sortedEntries.map((entry, i) => (
              <FoodLogEntry
                key={entry.id}
                entry={entry}
                index={i}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="glass-card p-lg sm:p-xl flex flex-col items-center justify-center text-center animate-fade-in-up py-10 sm:py-14">
      <div className="text-5xl sm:text-6xl mb-md relative">
        🍽️
        <span
          className="absolute -top-2 -left-3 text-2xl animate-bounce"
          style={{ animationDelay: '0s', animationDuration: '2s' }}
        >
          🥗
        </span>
        <span
          className="absolute -top-1 -right-4 text-xl animate-bounce"
          style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}
        >
          🍎
        </span>
        <span
          className="absolute -bottom-2 -left-5 text-lg animate-bounce"
          style={{ animationDelay: '1s', animationDuration: '3s' }}
        >
          🥑
        </span>
      </div>
      <p className="text-text-primary text-lg sm:text-xl font-bold mb-xs">
        עדיין לא אכלת היום
      </p>
      <p className="text-text-secondary text-body-sm max-w-[250px]">
        הכל מוכן — תפתח אוכל ליד המצלמה
      </p>
    </div>
  );
}
