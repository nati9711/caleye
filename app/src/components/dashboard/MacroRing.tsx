import { useEffect, useState } from 'react';

interface MacroRingProps {
  /** Protein consumed in grams */
  protein: number;
  /** Carbs consumed in grams */
  carbs: number;
  /** Fat consumed in grams */
  fat: number;
  /** Target grams: { protein, carbs, fat } */
  targets: { protein: number; carbs: number; fat: number };
  /** Diameter of the ring in pixels */
  size?: number;
  /** Text to display in the center (defaults to total calories) */
  centerLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

const MACRO_COLORS = {
  protein: '#3b82f6',
  carbs: '#22c55e',
  fat: '#f59e0b',
} as const;

const MACRO_LABELS = {
  protein: 'חלבון',
  carbs: 'פחמימות',
  fat: 'שומן',
} as const;

/**
 * SVG donut chart with 3 animated segments for protein, carbs, fat.
 * Each segment draws in sequentially with stroke-dashoffset transitions.
 * Center displays total calories or a custom label.
 * Legend with colored dots appears below the ring.
 */
export default function MacroRing({
  protein,
  carbs,
  fat,
  targets,
  size = 140,
  centerLabel,
  className = '',
}: MacroRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = protein + carbs + fat;
  const totalTarget = targets.protein + targets.carbs + targets.fat;

  // Calculate percentages of actual intake
  const proteinPct = total > 0 ? protein / total : 0;
  const carbsPct = total > 0 ? carbs / total : 0;
  const fatPct = total > 0 ? fat / total : 0;

  // SVG ring parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Segment arcs — each segment is a portion of the full circumference
  const proteinArc = circumference * proteinPct;
  const carbsArc = circumference * carbsPct;
  const fatArc = circumference * fatPct;

  // Offsets — each segment starts where the previous one ended
  // SVG circles start at 3 o'clock; rotate -90deg to start at 12 o'clock
  const proteinOffset = 0;
  const carbsOffset = proteinArc;
  const fatOffset = proteinArc + carbsArc;

  // Percentage display values
  const proteinDisplay = total > 0 ? Math.round((protein / total) * 100) : 0;
  const carbsDisplay = total > 0 ? Math.round((carbs / total) * 100) : 0;
  const fatDisplay = total > 0 ? Math.round((fat / total) * 100) : 0;

  // Default center label: percentage of target
  const pctOfTarget = totalTarget > 0 ? Math.round((total / totalTarget) * 100) : 0;
  const displayCenter = centerLabel ?? `${pctOfTarget}%`;

  return (
    <div className={`flex flex-col items-center gap-sm ${className}`}>
      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Fat segment (drawn first = bottom layer) */}
          {fat > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={MACRO_COLORS.fat}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${fatArc} ${circumference - fatArc}`}
              strokeDashoffset={mounted ? -fatOffset : circumference}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-out 0.4s',
              }}
            />
          )}

          {/* Carbs segment */}
          {carbs > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={MACRO_COLORS.carbs}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${carbsArc} ${circumference - carbsArc}`}
              strokeDashoffset={mounted ? -carbsOffset : circumference}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-out 0.2s',
              }}
            />
          )}

          {/* Protein segment (drawn last = top layer) */}
          {protein > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={MACRO_COLORS.protein}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${proteinArc} ${circumference - proteinArc}`}
              strokeDashoffset={mounted ? -proteinOffset : circumference}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-out 0s',
              }}
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-text-primary font-bold text-lg leading-none">
            {displayCenter}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-md text-body-sm">
        <LegendItem
          color={MACRO_COLORS.protein}
          label={MACRO_LABELS.protein}
          value={`${proteinDisplay}%`}
          grams={`${protein}g`}
        />
        <LegendItem
          color={MACRO_COLORS.carbs}
          label={MACRO_LABELS.carbs}
          value={`${carbsDisplay}%`}
          grams={`${carbs}g`}
        />
        <LegendItem
          color={MACRO_COLORS.fat}
          label={MACRO_LABELS.fat}
          value={`${fatDisplay}%`}
          grams={`${fat}g`}
        />
      </div>
    </div>
  );
}

// ─── Legend item ──────────────────────────────────────────────────────

interface LegendItemProps {
  color: string;
  label: string;
  value: string;
  grams: string;
}

function LegendItem({ color, label, value, grams }: LegendItemProps) {
  return (
    <div className="flex items-center gap-xs">
      <span
        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-semibold">{value}</span>
      <span className="text-text-tertiary">({grams})</span>
    </div>
  );
}
