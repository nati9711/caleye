import React, { useEffect, useState } from 'react';
import type { DetectionResult } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface DetectionOverlayProps {
  /** The detection result to display */
  result: DetectionResult | null;
  /** Whether detection is currently active */
  isDetecting: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DISPLAY_DURATION_MS = 3000;

// ── Component ────────────────────────────────────────────────────────────────

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  result,
  isDetecting,
}) => {
  const [visible, setVisible] = useState(false);
  const [displayResult, setDisplayResult] = useState<DetectionResult | null>(null);

  // Show overlay when a new eating detection comes in, fade out after 3s
  useEffect(() => {
    if (!result || !result.eating || !isDetecting) {
      return;
    }

    setDisplayResult(result);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_DURATION_MS);

    return () => clearTimeout(timer);
  }, [result, isDetecting]);

  // Don't render anything if no result or not visible
  if (!displayResult || !displayResult.eating || !visible) {
    return null;
  }

  const confidencePercent = Math.round((displayResult.confidence ?? 0) * 100);

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Animated border */}
      <div style={styles.boundingBox}>
        <div style={styles.corner} data-pos="top-left" />
        <div style={styles.corner} data-pos="top-right" />
        <div style={styles.corner} data-pos="bottom-left" />
        <div style={styles.corner} data-pos="bottom-right" />
      </div>

      {/* Food label */}
      <div style={styles.label}>
        <span style={styles.foodName}>
          {displayResult.foodHe ?? displayResult.food}
        </span>
        <span style={styles.confidence}>{confidencePercent}%</span>
      </div>

      {/* Animated scanning line */}
      <div style={styles.scanLine} />

      {/* Inline styles for animations — injected once */}
      <style>{`
        @keyframes caleye-scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes caleye-pulse-border {
          0%, 100% { border-color: #22D97F; }
          50% { border-color: #10B981; }
        }
        @keyframes caleye-fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        [data-pos="top-left"] {
          position: absolute; top: -2px; left: -2px;
          width: 16px; height: 16px;
          border-top: 3px solid #22D97F; border-left: 3px solid #22D97F;
          border-radius: 4px 0 0 0;
        }
        [data-pos="top-right"] {
          position: absolute; top: -2px; right: -2px;
          width: 16px; height: 16px;
          border-top: 3px solid #22D97F; border-right: 3px solid #22D97F;
          border-radius: 0 4px 0 0;
        }
        [data-pos="bottom-left"] {
          position: absolute; bottom: -2px; left: -2px;
          width: 16px; height: 16px;
          border-bottom: 3px solid #22D97F; border-left: 3px solid #22D97F;
          border-radius: 0 0 0 4px;
        }
        [data-pos="bottom-right"] {
          position: absolute; bottom: -2px; right: -2px;
          width: 16px; height: 16px;
          border-bottom: 3px solid #22D97F; border-right: 3px solid #22D97F;
          border-radius: 0 0 4px 0;
        }
      `}</style>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease',
    zIndex: 10,
    animation: 'caleye-fade-in 0.3s ease',
  },
  boundingBox: {
    position: 'absolute',
    inset: 8,
    border: '1px solid rgba(34, 217, 127, 0.4)',
    borderRadius: 8,
    animation: 'caleye-pulse-border 2s ease-in-out infinite',
  },
  corner: {
    // Positioned by data-pos attribute styles above
  },
  label: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 12px',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    whiteSpace: 'nowrap',
    direction: 'rtl',
  },
  foodName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#F1F5F9',
    fontFamily: 'Heebo, sans-serif',
  },
  confidence: {
    fontSize: 11,
    fontWeight: 500,
    color: '#22D97F',
    fontFamily: 'Sora, sans-serif',
  },
  scanLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2,
    background: 'linear-gradient(90deg, transparent, #22D97F, transparent)',
    opacity: 0.6,
    animation: 'caleye-scan 2s ease-in-out infinite',
  },
};
