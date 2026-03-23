import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

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
  const strokeWidth = 16;
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

  // Default center label: percentage of target
  const pctOfTarget = totalTarget > 0 ? Math.round((total / totalTarget) * 100) : 0;
  const displayCenter = centerLabel ?? `${pctOfTarget}%`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="proteinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="carbsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="fatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Fat segment (drawn first = bottom layer) */}
          {fat > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#fatGrad)"
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
              stroke="url(#carbsGrad)"
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
              stroke="url(#proteinGrad)"
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
          <span className="text-text-primary font-bold text-xl leading-none font-sora">
            {displayCenter}
          </span>
          <span className="text-text-tertiary text-[9px] mt-0.5">מאקרו</span>
        </div>
      </div>

      {/* Legend — compact colored circles + text */}
      <div className="flex items-center gap-3 sm:gap-4 text-caption sm:text-body-sm flex-wrap justify-center">
        <LegendItem
          color={MACRO_COLORS.protein}
          label={MACRO_LABELS.protein}
          grams={`${protein}g`}
          target={`${targets.protein}g`}
        />
        <LegendItem
          color={MACRO_COLORS.carbs}
          label={MACRO_LABELS.carbs}
          grams={`${carbs}g`}
          target={`${targets.carbs}g`}
        />
        <LegendItem
          color={MACRO_COLORS.fat}
          label={MACRO_LABELS.fat}
          grams={`${fat}g`}
          target={`${targets.fat}g`}
        />
      </div>
    </motion.div>
  );
}

// ─── Legend item ──────────────────────────────────────────────────────

interface LegendItemProps {
  color: string;
  label: string;
  grams: string;
  target: string;
}

function LegendItem({ color, label, grams, target }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}44` }}
      />
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-semibold tabular-nums">{grams}</span>
      <span className="text-text-tertiary tabular-nums">/{target}</span>
    </div>
  );
}
