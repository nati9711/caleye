import { useState } from 'react';
import { motion } from 'motion/react';
import { setApiKey, testConnection } from '../../lib/gemini';

interface WelcomeScreenProps {
  /** Called when user completes onboarding with a valid API key */
  onComplete: () => void;
}

/**
 * Welcome / onboarding screen shown when there's no API key
 * and no food log history. Explains the app and collects the API key.
 */
export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStart = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await testConnection(trimmed);
      if (result.success) {
        setApiKey(trimmed);
        onComplete();
      } else {
        setValidationError(result.error ?? 'מפתח API לא תקין');
      }
    } catch {
      setValidationError('שגיאה בבדיקת המפתח — בדוק את חיבור האינטרנט');
    } finally {
      setIsValidating(false);
    }
  };

  const steps = [
    { icon: '🔑', text: 'חבר API key' },
    { icon: '📷', text: 'אשר גישה למצלמה' },
    { icon: '🍎', text: 'תאכל — והמערכת תזהה!' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            👁️
          </motion.div>
          <h1 className="font-sora font-bold text-3xl gradient-text mb-2">CalEye</h1>
          <p className="text-text-secondary text-lg">העין שסופרת בשבילך</p>
        </div>

        {/* Steps */}
        <div className="glass-card p-5 mb-6">
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {step.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary text-sm font-mono">{i + 1}.</span>
                  <span className="text-text-primary text-sm font-medium">{step.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🔗</span>
            <span className="text-sm font-bold text-white">OpenRouter API Key</span>
          </div>

          <p className="text-xs text-text-secondary mb-3 leading-relaxed">
            CalEye משתמש ב-OpenRouter כדי לזהות אוכל דרך המצלמה.
            <br />המפתח נשמר רק במכשיר שלך — לא נשלח לשום מקום.
          </p>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs font-medium mb-3 hover:underline"
            style={{ color: '#22D97F' }}
          >
            קבל מפתח חינם מ-OpenRouter →
          </a>

          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setValidationError(null);
              }}
              placeholder="sk-or-..."
              className="w-full p-3 pr-10 rounded-lg text-white text-sm font-mono"
              style={{
                background: '#0a0e17',
                border: validationError
                  ? '1px solid rgba(239,68,68,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              dir="ltr"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="text-xs text-red-400 mb-3 flex items-center gap-1">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!key.trim() || isValidating}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: key.trim() && !isValidating ? '#22D97F' : 'rgba(34,217,127,0.2)',
              color: key.trim() && !isValidating ? '#0a0e17' : 'rgba(255,255,255,0.3)',
            }}
          >
            {isValidating ? '🔄 בודק מפתח...' : '🚀 התחל'}
          </button>

          <p className="text-center text-xs text-gray-600 mt-3">
            🔒 המפתח נשמר ב-localStorage בלבד
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
