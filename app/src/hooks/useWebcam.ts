import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

// ── Types ────────────────────────────────────────────────────────────────────

export type WebcamStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'error';

export interface UseWebcamReturn {
  /** Ref to attach to the <Webcam /> component */
  webcamRef: React.RefObject<Webcam | null>;
  /** Current status of the webcam */
  status: WebcamStatus;
  /** Whether the webcam is ready to capture frames */
  isReady: boolean;
  /** Capture a JPEG frame as a base64 string (no data URI prefix) */
  capture: () => string | null;
  /** Human-readable error message (Hebrew) */
  error: string | null;
  /** Retry camera access after a denial or error */
  retry: () => void;
}

// ── Webcam constraints ───────────────────────────────────────────────────────

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user',
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useWebcam(): UseWebcamReturn {
  const webcamRef = useRef<Webcam>(null);
  const [status, setStatus] = useState<WebcamStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Request camera access on mount
  useEffect(() => {
    let cancelled = false;

    async function requestCamera(): Promise<void> {
      setStatus('requesting');
      setError(null);

      try {
        // Check if getUserMedia is supported
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new DOMException(
            'getUserMedia not supported',
            'NotSupportedError'
          );
        }

        // Pre-check permissions (non-blocking — some browsers expose this)
        if (navigator.permissions) {
          try {
            const permissionStatus = await navigator.permissions.query({
              name: 'camera' as PermissionName,
            });
            if (permissionStatus.state === 'denied' && !cancelled) {
              setStatus('denied');
              setError('הגישה למצלמה נדחתה. יש לאפשר גישה בהגדרות הדפדפן.');
              return;
            }
          } catch {
            // Permissions API not available for camera — continue normally
          }
        }

        // Actually request camera (this triggers the browser prompt)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS,
          audio: false,
        });

        // We don't need to hold onto this stream — react-webcam manages its own.
        // Stop the test stream to avoid duplicate camera access.
        stream.getTracks().forEach((track) => track.stop());

        if (!cancelled) {
          setStatus('active');
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof DOMException) {
          switch (err.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
              setStatus('denied');
              setError('הגישה למצלמה נדחתה. יש לאפשר גישה בהגדרות הדפדפן.');
              break;
            case 'NotFoundError':
            case 'DevicesNotFoundError':
              setStatus('error');
              setError('לא נמצאה מצלמה. יש לחבר מצלמה ולנסות שוב.');
              break;
            case 'NotReadableError':
            case 'TrackStartError':
              setStatus('error');
              setError('המצלמה בשימוש על ידי אפליקציה אחרת.');
              break;
            case 'NotSupportedError':
              setStatus('error');
              setError('הדפדפן לא תומך בגישה למצלמה. יש לפתוח ב-HTTPS.');
              break;
            default:
              setStatus('error');
              setError(`שגיאת מצלמה: ${err.message}`);
          }
        } else {
          setStatus('error');
          setError('שגיאה לא צפויה בגישה למצלמה.');
        }
      }
    }

    requestCamera();

    return () => {
      cancelled = true;
    };
  }, []);

  // Capture a frame from the webcam
  const capture = useCallback((): string | null => {
    if (!webcamRef.current) return null;

    const screenshot = webcamRef.current.getScreenshot({
      width: 640,
      height: 480,
    });

    if (!screenshot) return null;

    // Strip the data URI prefix (e.g. "data:image/jpeg;base64,")
    const commaIndex = screenshot.indexOf(',');
    if (commaIndex === -1) return screenshot;
    return screenshot.slice(commaIndex + 1);
  }, []);

  // Retry after denial or error
  const retry = useCallback(() => {
    setStatus('idle');
    setError(null);
    // Re-trigger the useEffect by forcing a re-mount scenario.
    // In practice, the component using this hook should conditionally
    // render the <Webcam /> based on status, so we just reset state.
    // The user may need to refresh or re-grant permissions.
    window.location.reload();
  }, []);

  return {
    webcamRef,
    status,
    isReady: status === 'active',
    capture,
    error,
    retry,
  };
}
