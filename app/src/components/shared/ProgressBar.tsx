import { useEffect, useState } from 'react';

interface ProgressBarProps {
  /** Fill percentage (0–100) */
  value: number;
  /** Bar height in pixels */
  height?: number;
  /** Whether to display the percentage label inside the bar */
  showLabel?: boolean;
  /** Additional CSS class names for the outer container */
  className?: string;
}

/**
 * Animated progress bar with gradient fill (accent -> accent-cyan).
 * The fill width animates on mount and on value changes via CSS transition.
 */
export default function ProgressBar({
  value,
  height = 12,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const [mounted, setMounted] = useState(false);
  const clampedValue = Math.max(0, Math.min(100, value));

  useEffect(() => {
    // Trigger the fill animation on next frame so the transition plays
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${className}`}
      style={{
        height: `${height}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Animated fill bar */}
      <div
        className="absolute inset-y-0 start-0 rounded-full gradient-fill transition-all duration-1000 ease-out"
        style={{
          width: mounted ? `${clampedValue}%` : '0%',
        }}
      />

      {/* Percentage label */}
      {showLabel && clampedValue > 8 && (
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-bg-deep"
          style={{ lineHeight: `${height}px` }}
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
