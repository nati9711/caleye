import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiKey, setApiKey, testConnection } from '../../lib/gemini';

interface WelcomeScreenProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'apikey' | 'testing' | 'ready';

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [key, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  // Check if there's already a saved key
  useEffect(() => {
    const saved = getApiKey();
    if (saved) {
      setHasSavedKey(true);
      setKeyInput(saved);
    }
  }, []);

  const handleTest = async () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('הכנס מפתח API');
      return;
    }

    setIsValidating(true);
    setError(null);
    setStep('testing');

    try {
      const result = await testConnection(trimmed);
      if (result.success) {
        setApiKey(trimmed);
        setStep('ready');
        // Auto-proceed after 1.5s
        setTimeout(() => onComplete(), 1500);
      } else {
        setError(result.error ?? 'מפתח לא תקין');
        setStep('apikey');
      }
    } catch {
      setError('שגיאה בבדיקת המפתח — בדוק חיבור אינטרנט');
      setStep('apikey');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUseSaved = async () => {
    setIsValidating(true);
    setStep('testing');
    setError(null);
    try {
      const result = await testConnection();
      if (result.success) {
        setStep('ready');
        setTimeout(() => onComplete(), 1500);
      } else {
        setError('המפתח השמור כבר לא עובד — הכנס מפתח חדש');
        setStep('apikey');
        setHasSavedKey(false);
      }
    } catch {
      setError('שגיאה בחיבור');
      setStep('apikey');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center top, rgba(34,217,127,0.06), #0A0E17 60%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(34,217,127,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(34,217,127,0.2)',
              boxShadow: '0 0 40px rgba(34,217,127,0.15)',
            }}
          >
            👁️
          </motion.div>
          <h1 className="font-sora font-bold text-4xl gradient-text-glow mb-2">CalEye</h1>
          <p className="text-text-secondary text-base">העין שסופרת בשבילך</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['welcome', 'apikey', 'ready'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: step === s || (s === 'welcome' && step !== 'welcome')
                    || (s === 'apikey' && (step === 'testing' || step === 'ready'))
                    || step === 'ready'
                    ? '#22D97F'
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: step === s ? '0 0 8px rgba(34,217,127,0.5)' : 'none',
                }}
              />
              {i < 2 && (
                <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card-premium p-6"
            >
              <div className="space-y-4 mb-6">
                {[
                  { icon: '📷', num: 1, text: 'המצלמה רואה מה אתה אוכל' },
                  { icon: '🧠', num: 2, text: 'AI מזהה ומחשב קלוריות' },
                  { icon: '📊', num: 3, text: 'הכל נרשם אוטומטית בדשבורד' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl relative"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {item.icon}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: 'rgba(34,217,127,0.2)', color: '#22D97F', border: '1px solid rgba(34,217,127,0.3)' }}
                      >{item.num}</span>
                    </div>
                    <span className="text-text-primary text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Saved key found */}
              {hasSavedKey && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl p-3 mb-4 flex items-center gap-2"
                  style={{ background: 'rgba(34,217,127,0.08)', border: '1px solid rgba(34,217,127,0.15)' }}
                >
                  <span className="text-lg">✅</span>
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium block">נמצא מפתח שמור</span>
                    <span className="text-xs text-text-tertiary">sk-or-...{key.slice(-4)}</span>
                  </div>
                  <button
                    onClick={handleUseSaved}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                    style={{ background: '#22D97F', color: '#0a0e17' }}
                  >
                    המשך
                  </button>
                </motion.div>
              )}

              <button
                onClick={() => setStep('apikey')}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: hasSavedKey ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #22D97F, #06B6D4)',
                  color: hasSavedKey ? '#94A3B8' : '#0a0e17',
                  boxShadow: hasSavedKey ? 'none' : '0 4px 20px rgba(34,217,127,0.25)',
                }}
              >
                {hasSavedKey ? 'הכנס מפתח אחר' : '🔑 התחל — חבר API key'}
              </button>
            </motion.div>
          )}

          {/* Step 2: API Key Input */}
          {step === 'apikey' && (
            <motion.div
              key="apikey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card-premium p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>🔗</span>
                <span className="text-sm font-bold text-white">OpenRouter API Key</span>
              </div>
              <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
                המפתח נשמר רק במכשיר שלך. <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="hover:underline" style={{ color: '#22D97F' }}>קבל מפתח חינם →</a>
              </p>

              <div className="relative mb-3">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => { setKeyInput(e.target.value); setError(null); }}
                  placeholder="sk-or-..."
                  className="w-full p-3.5 pr-10 rounded-xl text-white text-sm font-mono transition-all focus:ring-1 focus:ring-accent/30 focus:outline-none"
                  style={{
                    background: 'rgba(10,14,23,0.8)',
                    border: error ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                  dir="ltr"
                  autoFocus
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white text-xs"
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg px-3 py-2 mb-3 flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <span className="text-red-400 text-xs mt-0.5">⚠️</span>
                  <span className="text-red-300 text-xs leading-relaxed">{error}</span>
                </motion.div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  disabled={!key.trim() || isValidating}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: key.trim() ? 'linear-gradient(135deg, #22D97F, #06B6D4)' : 'rgba(34,217,127,0.12)',
                    color: key.trim() ? '#0a0e17' : 'rgba(255,255,255,0.3)',
                    boxShadow: key.trim() ? '0 4px 20px rgba(34,217,127,0.25)' : undefined,
                  }}
                >
                  {isValidating ? '⏳ בודק...' : '🔍 בדוק והתחל'}
                </button>
                <button
                  onClick={() => setStep('welcome')}
                  className="px-4 py-3.5 rounded-xl text-text-tertiary hover:text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  חזרה
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Testing */}
          {step === 'testing' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card-premium p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,217,127,0.1)', border: '1px solid rgba(34,217,127,0.2)' }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="text-3xl inline-block"
                >
                  🔄
                </motion.span>
              </div>
              <p className="text-white font-semibold text-lg mb-1">בודק מפתח...</p>
              <p className="text-text-tertiary text-sm">מתחבר ל-OpenRouter</p>
            </motion.div>
          )}

          {/* Step: Ready! */}
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card-premium p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,217,127,0.15)', border: '1px solid rgba(34,217,127,0.3)' }}
              >
                <span className="text-3xl">✅</span>
              </motion.div>
              <p className="text-white font-semibold text-lg mb-1">מחובר!</p>
              <p className="text-text-tertiary text-sm">מעביר לדשבורד...</p>
              <div className="w-24 h-1 rounded-full mx-auto mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                  className="h-full rounded-full"
                  style={{ background: '#22D97F' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-text-tertiary mt-4">
          🔒 הכל נשאר במכשיר שלך — אף מידע לא נשלח לשרתים שלנו
        </p>
      </motion.div>
    </div>
  );
}
