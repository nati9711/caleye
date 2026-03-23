import type { FoodEntry } from '../../types';
import FoodLogEntry from './FoodLogEntry';

interface FoodLogProps {
  /** Array of food entries to display (will be sorted newest first) */
  entries: FoodEntry[];
  /** Callback when edit button is clicked on an entry */
  onEditEntry?: (entry: FoodEntry) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Vertical scrollable food log list.
 * Displays entries newest first. Shows an empty state when no entries exist.
 * Each entry is a FoodLogEntry component with staggered slide-in animation.
 * Max height with internal scroll on desktop.
 */
export default function FoodLog({ entries, onEditEntry, className = '' }: FoodLogProps) {
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
          {sortedEntries.map((entry, i) => (
            <FoodLogEntry
              key={entry.id}
              entry={entry}
              index={i}
              onEdit={onEditEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="glass-card p-lg sm:p-xl flex flex-col items-center justify-center text-center animate-fade-in-up">
      <span className="text-4xl mb-md">🍽️</span>
      <p className="text-text-primary text-body font-semibold mb-xs">
        עדיין לא אכלת היום
      </p>
      <p className="text-text-secondary text-body-sm">
        המצלמה פעילה — תאכל משהו ואני אזהה את זה!
      </p>
    </div>
  );
}
