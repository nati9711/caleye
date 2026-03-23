import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface HourlyData {
  hour: number;
  calories: number;
  foods: string[];
}

interface HourlyChartProps {
  /** Array of hourly calorie data (hour 6–23) */
  data: HourlyData[];
  /** Additional CSS class names */
  className?: string;
}

/** Returns the bar color based on calorie amount */
function getBarColor(calories: number): string {
  if (calories <= 0) return 'transparent';
  if (calories <= 300) return '#22c55e';
  if (calories <= 600) return '#f59e0b';
  return '#FB7185';
}

/** Returns the bar color label in Hebrew */
function getBarLabel(calories: number): string {
  if (calories <= 300) return 'ארוחה קלה';
  if (calories <= 600) return 'ארוחה בינונית';
  return 'ארוחה כבדה';
}

/**
 * Vertical bar chart showing calories per hour (6–23).
 * Bars are color-coded: green (0–300), amber (301–600), coral (601+).
 * Current hour has a subtle pulse glow. Future hours show dashed outlines.
 * Bars animate growing from 0 on mount with staggered delays.
 * Mobile: horizontal scroll. Pure CSS/SVG, no chart library.
 */
export default function HourlyChart({ data, className = '' }: HourlyChartProps) {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState<{
    hour: number;
    calories: number;
    foods: string[];
    x: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentHour = new Date().getHours();
  const maxCalories = Math.max(...data.map((d) => d.calories), 100);

  // Trigger bar animation when component enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Wider bars on mobile for easier touch interaction
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const barWidth = isMobile ? 36 : 28;
  const barGap = isMobile ? 10 : 8;
  const chartHeight = 160;
  const totalWidth = data.length * (barWidth + barGap);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`glass-card p-3 sm:p-lg ${className}`}
    >
      {/* Title */}
      <h3 className="text-h3 text-text-primary mb-md">קלוריות לפי שעה</h3>

      {/* Chart container — horizontal scroll with touch momentum on mobile */}
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide touch-scroll-x"
      >
        <div
          className="relative"
          style={{ width: `${totalWidth}px`, height: `${chartHeight + 40}px` }}
        >
          {/* Y-axis reference lines */}
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <div
              key={pct}
              className="absolute inset-x-0 border-t border-white/[0.04]"
              style={{ bottom: `${pct * chartHeight + 24}px` }}
            >
              <span className="absolute -top-3 end-full me-1 text-[10px] text-text-tertiary whitespace-nowrap">
                {Math.round(maxCalories * pct)}
              </span>
            </div>
          ))}

          {/* Bars */}
          <div className="absolute bottom-6 start-0 flex items-end gap-[8px]">
            {data.map((item, i) => {
              const isFuture = item.hour > currentHour;
              const isCurrent = item.hour === currentHour;
              const barHeight =
                item.calories > 0
                  ? Math.max((item.calories / maxCalories) * chartHeight, 4)
                  : 0;
              const color = getBarColor(item.calories);

              return (
                <div
                  key={item.hour}
                  className="relative flex flex-col items-center"
                  style={{ width: `${barWidth}px` }}
                >
                  {/* Bar */}
                  <motion.div
                    className={`relative rounded-t-[4px] cursor-pointer
                      ${isCurrent && item.calories > 0 ? 'animate-pulse-glow' : ''}
                    `}
                    initial={{ height: 0 }}
                    animate={{ height: visible ? barHeight : 0 }}
                    transition={{
                      duration: 0.5,
                      delay: visible ? i * 0.05 : 0,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    style={{
                      width: `${barWidth}px`,
                      backgroundColor: isFuture ? 'transparent' : color,
                      border: isFuture
                        ? '1px dashed rgba(255, 255, 255, 0.15)'
                        : item.calories > 0
                          ? 'none'
                          : '1px dashed rgba(255, 255, 255, 0.06)',
                      transformOrigin: 'bottom',
                      minHeight: isFuture ? '20px' : undefined,
                    }}
                    onClick={() =>
                      item.calories > 0 &&
                      setTooltip(
                        tooltip?.hour === item.hour
                          ? null
                          : { ...item, x: i * (barWidth + barGap) }
                      )
                    }
                    onMouseEnter={() =>
                      item.calories > 0 &&
                      setTooltip({ ...item, x: i * (barWidth + barGap) })
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {/* Hour label */}
                  <span className="text-[10px] text-text-tertiary mt-1 leading-none">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute glass-card-elevated px-sm py-xs z-10 whitespace-nowrap text-body-sm pointer-events-none"
              style={{
                bottom: `${chartHeight + 32}px`,
                left: `${tooltip.x}px`,
                transform: 'translateX(-25%)',
              }}
            >
              <div className="text-text-primary font-semibold">
                {tooltip.hour}:00 — {tooltip.calories} קק״ל
              </div>
              {tooltip.foods.length > 0 && (
                <div className="text-text-secondary text-caption">
                  {tooltip.foods.join('، ')}
                </div>
              )}
              <div className="text-text-tertiary text-caption">
                {getBarLabel(tooltip.calories)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* X-axis label */}
      <div className="text-center text-text-tertiary text-caption mt-xs">
        שעה ביום
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-sm sm:gap-md mt-sm text-caption flex-wrap">
        <LegendDot color="#22c55e" label="קלה (0-300)" />
        <LegendDot color="#f59e0b" label="בינונית (301-600)" />
        <LegendDot color="#FB7185" label="כבדה (601+)" />
      </div>
    </motion.div>
  );
}

// ─── Legend dot ───────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[4px]">
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      <span className="text-text-tertiary">{label}</span>
    </div>
  );
}
