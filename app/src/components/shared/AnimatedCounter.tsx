import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** Target numeric value to animate toward */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Text to prepend before the number */
  prefix?: string;
  /** Text to append after the number */
  suffix?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Animated counting number component.
 * Smoothly interpolates from 0 (or previous value) to the target value
 * using requestAnimationFrame with ease-out cubic easing.
 */
export default function AnimatedCounter({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const diff = value - startValue;
    const startTime = performance.now();

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.round(startValue + diff * easedProgress);

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = value;
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString('he-IL');

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
