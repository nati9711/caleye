import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import type { WebcamStatus } from '../../hooks/useWebcam';

// ── Types ────────────────────────────────────────────────────────────────────

interface WebcamFeedProps {
  /** Ref forwarded to the internal react-webcam */
  webcamRef: React.RefObject<Webcam>;
  /** Current webcam status */
  status: WebcamStatus;
  /** Whether the detection loop is active */
  isDetecting: boolean;
  /** Toggle detection on/off */
  onToggleDetection: () => void;
  /** Error message to display */
  error: string | null;
}

// ── Status indicator ─────────────────────────────────────────────────────────

function StatusDot({ status, isDetecting }: { status: WebcamStatus; isDetecting: boolean }) {
  if (status === 'active' && isDetecting) {
    return <span style={styles.statusDot} data-status="active">&#x1F7E2;</span>;
  }
  if (status === 'active' && !isDetecting) {
    return <span style={styles.statusDot} data-status="paused">&#x1F534;</span>;
  }
  return <span style={styles.statusDot} data-status="loading">&#x26AA;</span>;
}

// ── Component ────────────────────────────────────────────────────────────────

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  webcamRef,
  status,
  isDetecting,
  onToggleDetection,
  error,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDragging: false, startX: 0, startY: 0, left: 16, top: 0 });

  // Detect mobile viewport
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize mobile drag position
  useEffect(() => {
    if (isMobile) {
      dragState.current.top = window.innerHeight - 80 - 16;
    }
  }, [isMobile]);

  // ── Mobile drag handlers ─────────────────────────────────────────────

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    if (!touch) return;
    dragState.current.isDragging = true;
    dragState.current.startX = touch.clientX - dragState.current.left;
    dragState.current.startY = touch.clientY - dragState.current.top;
  }, [isMobile]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !dragState.current.isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    const newLeft = touch.clientX - dragState.current.startX;
    const newTop = touch.clientY - dragState.current.startY;

    // Clamp to viewport
    dragState.current.left = Math.max(0, Math.min(window.innerWidth - 64, newLeft));
    dragState.current.top = Math.max(0, Math.min(window.innerHeight - 64, newTop));

    if (dragRef.current) {
      dragRef.current.style.left = `${dragState.current.left}px`;
      dragRef.current.style.top = `${dragState.current.top}px`;
    }
  }, [isMobile]);

  const onTouchEnd = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  // ── Render: Mobile floating circle ───────────────────────────────────

  if (isMobile) {
    return (
      <div
        ref={dragRef}
        onClick={onToggleDetection}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          ...styles.mobileContainer,
          ...(isDetecting ? styles.detectingGlow : {}),
        }}
        role="button"
        tabIndex={0}
        aria-label={isDetecting ? 'עצור זיהוי' : 'התחל זיהוי'}
      >
        {status === 'active' ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            }}
            style={styles.mobileVideo}
            mirrored
          />
        ) : (
          <div style={styles.mobileStatusCircle}>
            <StatusDot status={status} isDetecting={isDetecting} />
          </div>
        )}

        {/* Status indicator overlay */}
        <div style={styles.mobileStatusBadge}>
          <StatusDot status={status} isDetecting={isDetecting} />
        </div>
      </div>
    );
  }

  // ── Render: Desktop PiP ──────────────────────────────────────────────

  return (
    <div
      onClick={onToggleDetection}
      style={{
        ...styles.desktopContainer,
        ...(isDetecting ? styles.detectingGlow : {}),
      }}
      role="button"
      tabIndex={0}
      aria-label={isDetecting ? 'עצור זיהוי' : 'התחל זיהוי'}
    >
      {status === 'active' ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          }}
          style={styles.desktopVideo}
          mirrored
        />
      ) : (
        <div style={styles.desktopPlaceholder}>
          {error && <p style={styles.errorText}>{error}</p>}
          {!error && status === 'requesting' && (
            <p style={styles.loadingText}>&#x23F3; מחבר מצלמה...</p>
          )}
          {!error && status === 'denied' && (
            <p style={styles.errorText}>&#x1F512; גישה למצלמה נדחתה</p>
          )}
          {!error && status === 'idle' && (
            <p style={styles.loadingText}>&#x1F4F7; מצלמה</p>
          )}
        </div>
      )}

      {/* Status bar */}
      <div style={styles.statusBar}>
        <StatusDot status={status} isDetecting={isDetecting} />
        <span style={styles.statusText}>
          {isDetecting ? '\u{1F441}\uFE0F מחפש...' : 'מושהה'}
        </span>
      </div>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  desktopContainer: {
    position: 'fixed',
    bottom: 20,
    left: 20,
    width: 200,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111827',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    zIndex: 50,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  detectingGlow: {
    borderColor: '#22D97F',
    boxShadow: '0 0 20px rgba(34, 217, 127, 0.3), 0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  desktopVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  desktopPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  statusBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    direction: 'rtl',
  },
  statusDot: {
    fontSize: 10,
    lineHeight: 1,
  },
  statusText: {
    fontSize: 11,
    color: '#F1F5F9',
    fontFamily: 'Heebo, sans-serif',
  },
  errorText: {
    fontSize: 11,
    color: '#FB7185',
    textAlign: 'center',
    fontFamily: 'Heebo, sans-serif',
  },
  loadingText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Heebo, sans-serif',
  },

  // Mobile styles
  mobileContainer: {
    position: 'fixed',
    bottom: 16,
    left: 16,
    width: 64,
    height: 64,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#111827',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    zIndex: 50,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
    touchAction: 'none',
  },
  mobileVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mobileStatusCircle: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileStatusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
