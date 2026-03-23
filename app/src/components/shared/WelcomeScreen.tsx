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
    { icon: '🔑', text: 'חבר API key', description: 'מפתח חינם מ-OpenRouter' },
    { icon: '📷', text: 'אשר גישה למצלמה', description: 'זיהוי אוטומטי של אוכל' },
    { icon: '🍎', text: 'תאכל — והמערכת תזהה!', description: 'קלוריות ומאקרו מיידי' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center top, rgba(34,217,127,0.05), #0A0E17 60%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(34,217,127,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(34,217,127,0.2)',
              boxShadow: '0 0 40px rgba(34,217,127,0.15)',
            }}
          >
            👁️
          </motion.div>
          <h1 className="font-sora font-bold text-4xl gradient-text-glow mb-2 tracking-tight">CalEye</h1>
          <p className="text-text-secondary text-lg">העין שסופרת בשבילך</p>
        </div>

        {/* Steps */}
        <div className="glass-card-premium p-5 sm:p-6 mb-5">
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                {/* Numbered circle */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {step.icon}
                  {/* Step number */}
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: 'rgba(34,217,127,0.2)', color: '#22D97F', border: '1px solid rgba(34,217,127,0.3)' }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div>
                  <span className="text-text-primary text-sm font-semibold block">{step.text}</span>
                  <span className="text-text-tertiary text-xs">{step.description}</span>
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
          className="glass-card-premium p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🔗</span>
            <span className="text-sm font-bold text-white">OpenRouter API Key</span>
          </div>

          <p className="text-xs text-text-tertiary mb-3 leading-relaxed">
            CalEye משתמש ב-OpenRouter כדי לזהות אוכל דרך המצלמה.
            <br />המפתח נשמר רק במכשיר שלך — לא נשלח לשום מקום.
          </p>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs font-medium mb-3 hover:underline transition-colors"
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
              className="w-full p-3.5 pr-10 rounded-xl text-white text-sm font-mono transition-all focus:ring-1 focus:ring-accent/30 focus:outline-none"
              style={{
                background: 'rgba(10, 14, 23, 0.8)',
                border: validationError
                  ? '1px solid rgba(239,68,68,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              dir="ltr"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white text-xs transition-colors"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="text-xs text-red-400 mb-3 flex items-center gap-1.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!key.trim() || isValidating}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: key.trim() && !isValidating
                ? 'linear-gradient(135deg, #22D97F, #06B6D4)'
                : 'rgba(34,217,127,0.12)',
              color: key.trim() && !isValidating ? '#0a0e17' : 'rgba(255,255,255,0.3)',
              boxShadow: key.trim() && !isValidating ? '0 4px 20px rgba(34,217,127,0.25)' : undefined,
            }}
          >
            {isValidating ? 'בודק מפתח...' : 'התחל'}
          </button>

          <p className="text-center text-xs text-text-tertiary mt-3 flex items-center justify-center gap-1">
            <span>🔒</span> המפתח נשמר ב-localStorage בלבד
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
