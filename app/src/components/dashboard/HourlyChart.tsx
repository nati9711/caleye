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
  const barWidth = isMobile ? 36 : 30;
  const barGap = isMobile ? 10 : 10;
  const chartHeight = 170;
  const totalWidth = data.length * (barWidth + barGap);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`glass-card p-5 sm:p-6 ${className}`}
    >
      {/* Title with clock icon */}
      <div className="section-header">
        <span className="text-lg">🕐</span>
        <h3 className="text-h3 text-text-primary">קלוריות לפי שעה</h3>
      </div>

      {/* Chart container — horizontal scroll with gradient fade on edges */}
      <div className="relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none sm:hidden"
          style={{ background: 'linear-gradient(to right, rgba(26,26,46,0.9), transparent)' }}
        />
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none sm:hidden"
          style={{ background: 'linear-gradient(to left, rgba(26,26,46,0.9), transparent)' }}
        />

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
                <span className="absolute -top-3 end-full me-1.5 text-[10px] text-text-tertiary whitespace-nowrap tabular-nums">
                  {Math.round(maxCalories * pct)}
                </span>
              </div>
            ))}

            {/* Bars */}
            <div className="absolute bottom-6 start-0 flex items-end gap-[10px]">
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
                    {/* Pulsing dot for current hour */}
                    {isCurrent && item.calories > 0 && (
                      <div className="absolute -top-3 z-10 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                        />
                      </div>
                    )}

                    {/* Bar with rounded top and shadow */}
                    <motion.div
                      className={`relative cursor-pointer
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
                        borderRadius: '6px 6px 2px 2px',
                        border: isFuture
                          ? '1px dashed rgba(255, 255, 255, 0.1)'
                          : item.calories > 0
                            ? 'none'
                            : '1px dashed rgba(255, 255, 255, 0.04)',
                        transformOrigin: 'bottom',
                        minHeight: isFuture ? '20px' : undefined,
                        boxShadow: item.calories > 0 && !isFuture
                          ? `0 2px 8px ${color}33`
                          : undefined,
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
                    <span className={`text-[10px] mt-1.5 leading-none tabular-nums ${
                      isCurrent ? 'text-text-primary font-semibold' : 'text-text-tertiary'
                    }`}>
                      {item.hour}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute glass-card-elevated px-3 py-2 z-10 whitespace-nowrap text-body-sm pointer-events-none"
                style={{
                  bottom: `${chartHeight + 32}px`,
                  left: `${tooltip.x}px`,
                  transform: 'translateX(-25%)',
                }}
              >
                <div className="text-text-primary font-semibold text-sm">
                  {tooltip.hour}:00 — {tooltip.calories} קק״ל
                </div>
                {tooltip.foods.length > 0 && (
                  <div className="text-text-secondary text-caption mt-0.5">
                    {tooltip.foods.join('، ')}
                  </div>
                )}
                <div className="text-text-tertiary text-caption mt-0.5">
                  {getBarLabel(tooltip.calories)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-5 mt-3 text-caption flex-wrap">
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
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}44` }}
      />
      <span className="text-text-tertiary">{label}</span>
    </div>
  );
}
