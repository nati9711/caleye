import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FoodEntry } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface ToastData {
  id: string;
  entry: FoodEntry;
  visible: boolean;
}

interface ToastProps {
  /** The food entry to display */
  entry: FoodEntry;
  /** Called when toast is dismissed */
  onDismiss: (id: string) => void;
  /** Called when user clicks "correct" button */
  onCorrect: (entry: FoodEntry) => void;
}

interface ToastContainerProps {
  /** Called when user clicks "correct" on a toast */
  onCorrect: (entry: FoodEntry) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 5000;
const ANIMATION_DURATION_MS = 300;

// ── Food emoji map ───────────────────────────────────────────────────────────

const FOOD_EMOJIS: Record<string, string> = {
  pizza: '\u{1F355}',
  burger: '\u{1F354}',
  hamburger: '\u{1F354}',
  sandwich: '\u{1F96A}',
  salad: '\u{1F957}',
  rice: '\u{1F35A}',
  pasta: '\u{1F35D}',
  spaghetti: '\u{1F35D}',
  bread: '\u{1F35E}',
  egg: '\u{1F373}',
  eggs: '\u{1F373}',
  chicken: '\u{1F357}',
  meat: '\u{1F969}',
  steak: '\u{1F969}',
  fish: '\u{1F41F}',
  sushi: '\u{1F363}',
  soup: '\u{1F35C}',
  cake: '\u{1F370}',
  cookie: '\u{1F36A}',
  chocolate: '\u{1F36B}',
  'ice cream': '\u{1F368}',
  apple: '\u{1F34E}',
  banana: '\u{1F34C}',
  orange: '\u{1F34A}',
  fries: '\u{1F35F}',
  coffee: '\u2615',
  tea: '\u{1F375}',
  juice: '\u{1F9C3}',
  water: '\u{1F4A7}',
  shakshuka: '\u{1F373}',
  falafel: '\u{1F9C6}',
  hummus: '\u{1F957}',
  pita: '\u{1F96B}',
  schnitzel: '\u{1F357}',
};

function getFoodEmoji(food: string): string {
  const lower = food.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '\u{1F37D}\uFE0F'; // plate with cutlery fallback
}

// ── Single Toast ─────────────────────────────────────────────────────────────

const SingleToast: React.FC<ToastProps> = ({ entry, onDismiss, onCorrect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate in on mount
  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(entry.id), ANIMATION_DURATION_MS);
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [entry.id, onDismiss]);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
    setTimeout(() => onDismiss(entry.id), ANIMATION_DURATION_MS);
  }, [entry.id, onDismiss]);

  const handleCorrect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCorrect(entry);
      handleDismiss();
    },
    [entry, onCorrect, handleDismiss]
  );

  const confidencePercent = Math.round(entry.confidence * 100);
  const emoji = getFoodEmoji(entry.food);

  return (
    <div
      style={{
        ...styles.toast,
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
      }}
      onClick={handleDismiss}
      role="alert"
      dir="rtl"
    >
      {/* Row 1: Emoji + food name + calories */}
      <div style={styles.row1}>
        <span style={styles.emoji}>{emoji}</span>
        <span style={styles.foodName}>{entry.foodHe}</span>
        <span style={styles.calories}>
          {entry.calories} <span style={styles.caloriesUnit}>{'קק"ל'}</span>
        </span>
      </div>

      {/* Row 2: Macros */}
      <div style={styles.row2}>
        <span style={styles.macro}>
          <span style={styles.macroLabel}>{'ח:'}</span> {entry.protein}g
        </span>
        <span style={styles.macroDivider}>|</span>
        <span style={styles.macro}>
          <span style={styles.macroLabel}>{'פ:'}</span> {entry.carbs}g
        </span>
        <span style={styles.macroDivider}>|</span>
        <span style={styles.macro}>
          <span style={styles.macroLabel}>{'ש:'}</span> {entry.fat}g
        </span>
      </div>

      {/* Row 3: Confidence + correct button */}
      <div style={styles.row3}>
        <span style={styles.confidenceText}>
          {'\u05D1\u05D9\u05D8\u05D7\u05D5\u05DF:'} {confidencePercent}%
        </span>
        <button
          onClick={handleCorrect}
          style={styles.correctButton}
          type="button"
          aria-label={'\u05EA\u05E7\u05DF'}
        >
          {'\u270F\uFE0F \u05EA\u05E7\u05DF'}
        </button>
      </div>
    </div>
  );
};

// ── Toast Container (manages multiple toasts) ───────────────────────────────

// We expose an imperative API via a ref so the parent can push toasts
export interface ToastContainerHandle {
  showToast: (entry: FoodEntry) => void;
}

export const ToastContainer = React.forwardRef<
  ToastContainerHandle,
  ToastContainerProps
>(({ onCorrect }, ref) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Expose imperative method
  React.useImperativeHandle(ref, () => ({
    showToast: (entry: FoodEntry) => {
      setToasts((prev) => [
        ...prev,
        { id: entry.id, entry, visible: true },
      ]);
    },
  }));

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <SingleToast
          key={toast.id}
          entry={toast.entry}
          onDismiss={handleDismiss}
          onCorrect={onCorrect}
        />
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 20,
    left: 20, // RTL: top-left corner
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 360,
    width: '100%',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    backgroundColor: '#1A2332',
    border: '1px solid rgba(34, 217, 127, 0.3)',
    borderRadius: 16,
    padding: '14px 18px',
    direction: 'rtl',
    fontFamily: 'Heebo, sans-serif',
    cursor: 'pointer',
    transition: `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_DURATION_MS}ms ease`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 12px rgba(34, 217, 127, 0.1)',
    backdropFilter: 'blur(12px)',
  },
  row1: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#F1F5F9',
    flex: 1,
  },
  calories: {
    fontSize: 16,
    fontWeight: 700,
    color: '#22D97F',
    fontFamily: 'Sora, sans-serif',
  },
  caloriesUnit: {
    fontSize: 11,
    fontWeight: 400,
    color: '#94A3B8',
    fontFamily: 'Heebo, sans-serif',
  },
  row2: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingRight: 30, // align with food name (after emoji)
  },
  macro: {
    fontSize: 13,
    color: '#94A3B8',
  },
  macroLabel: {
    color: '#F1F5F9',
    fontWeight: 500,
  },
  macroDivider: {
    color: '#475569',
    fontSize: 12,
  },
  row3: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 30,
  },
  confidenceText: {
    fontSize: 12,
    color: '#475569',
  },
  correctButton: {
    background: 'none',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: '3px 10px',
    fontSize: 12,
    color: '#94A3B8',
    cursor: 'pointer',
    fontFamily: 'Heebo, sans-serif',
    transition: 'border-color 0.2s, color 0.2s',
  },
};
