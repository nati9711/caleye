import React, { useCallback, useEffect, useState } from 'react';
import { getApiKey, setApiKey, testConnection } from '../../lib/gemini';

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiKeyInputProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called after a valid key is saved */
  onKeySaved: () => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

// ── Component ────────────────────────────────────────────────────────────────

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [key, setKey] = useState('');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Load existing key on open
  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKey();
      if (existingKey) {
        setKey(existingKey);
      }
      setTestStatus('idle');
      setTestError(null);
    }
  }, [isOpen]);

  // ── Test connection ────────────────────────────────────────────────────

  const handleTest = useCallback(async () => {
    if (!key.trim()) {
      setTestError('\u05D9\u05E9 \u05DC\u05D4\u05D6\u05D9\u05DF \u05DE\u05E4\u05EA\u05D7 API');
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');
    setTestError(null);

    const result = await testConnection(key.trim());

    if (result.success) {
      setTestStatus('success');
      setTestError(null);
    } else {
      setTestStatus('error');
      setTestError(result.error ?? '\u05E9\u05D2\u05D9\u05D0\u05D4 \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2\u05D4');
    }
  }, [key]);

  // ── Save key ───────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!key.trim()) {
      setTestError('\u05D9\u05E9 \u05DC\u05D4\u05D6\u05D9\u05DF \u05DE\u05E4\u05EA\u05D7 API');
      return;
    }

    // Test before saving
    setTestStatus('testing');
    setTestError(null);

    const result = await testConnection(key.trim());

    if (result.success) {
      setApiKey(key.trim());
      setTestStatus('success');
      onKeySaved();
      // Close after a brief success indication
      setTimeout(onClose, 800);
    } else {
      setTestStatus('error');
      setTestError(result.error ?? '\u05E9\u05D2\u05D9\u05D0\u05D4 \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2\u05D4');
    }
  }, [key, onClose, onKeySaved]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [handleSave, onClose]
  );

  // ── Don't render if closed ─────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-title"
        dir="rtl"
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 id="api-key-title" style={styles.title}>
            {'\u{1F511} \u05D4\u05D2\u05D3\u05E8\u05EA \u05DE\u05E4\u05EA\u05D7 API'}
          </h2>
          <button
            onClick={onClose}
            style={styles.closeButton}
            type="button"
            aria-label={'\u05E1\u05D2\u05D5\u05E8'}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Description */}
        <p style={styles.description}>
          {'\u05E7\u05D0\u05DC\u05D0\u05D9\u05D9 \u05DE\u05E9\u05EA\u05DE\u05E9 \u05D1-Gemini Vision API \u05DC\u05D6\u05D9\u05D4\u05D5\u05D9 \u05DE\u05D6\u05D5\u05DF. \u05D4\u05DE\u05E4\u05EA\u05D7 \u05E0\u05E9\u05DE\u05E8 \u05D1\u05DE\u05DB\u05E9\u05D9\u05E8 \u05E9\u05DC\u05DA \u05D1\u05DC\u05D1\u05D3.'}
        </p>

        {/* Link to get API key */}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          {'\u{1F517} \u05E7\u05D1\u05DC \u05DE\u05E4\u05EA\u05D7 API \u05D1\u05D7\u05D9\u05E0\u05DD \u05DE-Google AI Studio'}
        </a>

        {/* Input */}
        <div style={styles.inputGroup}>
          <div style={styles.inputWrapper}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setTestStatus('idle');
                setTestError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="AIza..."
              style={styles.input}
              autoFocus
              dir="ltr"
            />
            <button
              onClick={() => setShowKey((prev) => !prev)}
              style={styles.toggleVisibility}
              type="button"
              aria-label={showKey ? '\u05D4\u05E1\u05EA\u05E8' : '\u05D4\u05E6\u05D2'}
            >
              {showKey ? '\u{1F648}' : '\u{1F441}\uFE0F'}
            </button>
          </div>
        </div>

        {/* Status */}
        {testStatus === 'testing' && (
          <p style={styles.statusTesting}>
            {'\u23F3 \u05D1\u05D5\u05D3\u05E7 \u05D7\u05D9\u05D1\u05D5\u05E8...'}
          </p>
        )}
        {testStatus === 'success' && (
          <p style={styles.statusSuccess}>
            {'\u2705 \u05D4\u05DE\u05E4\u05EA\u05D7 \u05EA\u05E7\u05D9\u05DF! \u05D4\u05D7\u05D9\u05D1\u05D5\u05E8 \u05DC-Gemini \u05E2\u05D5\u05D1\u05D3.'}
          </p>
        )}
        {testStatus === 'error' && testError && (
          <p style={styles.statusError}>{testError}</p>
        )}

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button
            onClick={handleTest}
            style={styles.testButton}
            type="button"
            disabled={testStatus === 'testing' || !key.trim()}
          >
            {'\u{1F50C} \u05D1\u05D3\u05D5\u05E7 \u05D7\u05D9\u05D1\u05D5\u05E8'}
          </button>
          <button
            onClick={handleSave}
            style={{
              ...styles.saveButton,
              ...(testStatus === 'testing' || !key.trim()
                ? styles.buttonDisabled
                : {}),
            }}
            type="button"
            disabled={testStatus === 'testing' || !key.trim()}
          >
            {'\u05E9\u05DE\u05D5\u05E8 \u05D5\u05D4\u05EA\u05D7\u05DC'}
          </button>
        </div>

        {/* Privacy note */}
        <p style={styles.privacy}>
          {'\u{1F512} \u05D4\u05DE\u05E4\u05EA\u05D7 \u05E0\u05E9\u05DE\u05E8 \u05D0\u05DA \u05D5\u05E8\u05E7 \u05D1-localStorage \u05E9\u05DC \u05D4\u05D3\u05E4\u05D3\u05E4\u05DF \u05E9\u05DC\u05DA. \u05D4\u05D5\u05D0 \u05DC\u05D0 \u05E0\u05E9\u05DC\u05D7 \u05DC\u05E9\u05E8\u05EA \u05D7\u05D9\u05E6\u05D5\u05E0\u05D9.'}
        </p>
      </div>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: 20,
  },
  modal: {
    backgroundColor: '#1A2332',
    borderRadius: 20,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '32px 28px',
    maxWidth: 440,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    fontFamily: 'Heebo, sans-serif',
    direction: 'rtl',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#F1F5F9',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  link: {
    display: 'block',
    fontSize: 13,
    color: '#06B6D4',
    textDecoration: 'none',
    marginBottom: 20,
    transition: 'color 0.2s',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0 12px',
    transition: 'border-color 0.2s',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#F1F5F9',
    fontSize: 15,
    fontFamily: 'Sora, monospace',
    padding: '12px 0',
    direction: 'ltr',
    textAlign: 'left',
  },
  toggleVisibility: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  statusTesting: {
    fontSize: 13,
    color: '#F59E0B',
    marginBottom: 16,
  },
  statusSuccess: {
    fontSize: 13,
    color: '#22D97F',
    marginBottom: 16,
  },
  statusError: {
    fontSize: 13,
    color: '#FB7185',
    marginBottom: 16,
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  testButton: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'Heebo, sans-serif',
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
  },
  saveButton: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #22D97F, #10B981)',
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'Heebo, sans-serif',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  privacy: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};
