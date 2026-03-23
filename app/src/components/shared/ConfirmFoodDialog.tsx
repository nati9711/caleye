import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { FoodEntry } from '../../types';

interface ConfirmFoodDialogProps {
  /** The detected food entry awaiting confirmation */
  entry: FoodEntry;
  /** Optional Hebrew question from the AI (e.g. "How many grams on the package?") */
  userQuestion?: string;
  /** Accept the entry as-is */
  onConfirm: (entry: FoodEntry) => void;
  /** Accept with edited grams — caller recalculates calories */
  onEdit: (entry: FoodEntry, newGrams: number) => void;
  /** Discard the entry */
  onReject: () => void;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return '#22c55e';
  if (confidence >= 0.7) return '#f59e0b';
  return '#ef4444';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return 'גבוה';
  if (confidence >= 0.7) return 'בינוני';
  return 'נמוך';
}

/**
 * Confirmation dialog shown when AI detection has low confidence
 * or when needs_user_input is true.
 * Bottom sheet on mobile, centered modal on desktop.
 */
export default function ConfirmFoodDialog({
  entry,
  userQuestion,
  onConfirm,
  onEdit,
  onReject,
}: ConfirmFoodDialogProps) {
  const [grams, setGrams] = useState(entry.calories > 0 ? 100 : 100);
  const [isEditing, setIsEditing] = useState(false);
  const confidencePct = Math.round(entry.confidence * 100);
  const confidenceColor = getConfidenceColor(entry.confidence);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onReject}
        />

        {/* Dialog — slides up from bottom on mobile, fades in on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-auto rounded-t-3xl md:rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(26, 26, 46, 0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(24px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile) */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          <div className="p-5 sm:p-6">
            {/* Title */}
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                🤔
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">לא בטוח לגמרי...</h2>
                <p className="text-xs text-text-tertiary">עזור לי לאשר את הזיהוי</p>
              </div>
            </div>

            {/* Thumbnail — large and prominent */}
            {entry.thumbnail && (
              <div
                className="w-full rounded-2xl overflow-hidden mb-4"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <img
                  src={entry.thumbnail}
                  alt={entry.foodHe}
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}

            {/* Detected food info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary text-sm">זיהיתי:</span>
                <span className="text-white font-semibold text-base">{entry.foodHe}</span>
              </div>
            </div>

            {/* Confidence indicator — visual bar */}
            <div
              className="flex items-center gap-3 mb-4 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <span className="text-text-tertiary text-xs">ביטחון:</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${confidencePct}%`, backgroundColor: confidenceColor, boxShadow: `0 0 8px ${confidenceColor}44` }}
                  />
                </div>
                <span className="font-bold text-sm tabular-nums" style={{ color: confidenceColor }}>
                  {confidencePct}%
                </span>
              </div>
              <span className="text-[10px] text-text-tertiary">({getConfidenceLabel(entry.confidence)})</span>
            </div>

            {/* AI question if present */}
            {userQuestion && (
              <div
                className="rounded-xl p-3.5 mb-4 text-sm"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="text-amber-400 font-medium">🤖 שאלה: </span>
                <span className="text-text-secondary">{userQuestion}</span>
              </div>
            )}

            {/* Grams editor */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <span className="text-text-tertiary text-sm">כמות משוערת:</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGrams(Math.max(1, grams - 10))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-text-secondary hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                      className="w-20 px-3 py-2 rounded-xl text-white text-sm font-mono text-center focus:ring-1 focus:ring-accent/30 focus:outline-none"
                      style={{ background: 'rgba(10,14,23,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                      dir="ltr"
                      autoFocus
                      min={1}
                      max={5000}
                    />
                    <button
                      onClick={() => setGrams(Math.min(5000, grams + 10))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-text-secondary hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      +
                    </button>
                    <span className="text-text-tertiary text-sm">גרם</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white hover:bg-white/[0.06] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="tabular-nums">{entry.calories > 0 ? `~${Math.round((entry.calories / 2.5))}` : '100'}</span>
                    <span className="text-text-tertiary">גרם</span>
                    <span className="text-text-tertiary text-xs mr-1">✏️</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={() => onConfirm(entry)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #22D97F, #06B6D4)',
                  color: '#0a0e17',
                  boxShadow: '0 4px 16px rgba(34,217,127,0.2)',
                }}
              >
                נכון
              </button>
              <button
                onClick={() => onEdit(entry, grams)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                תקן
              </button>
              <button
                onClick={onReject}
                className="px-5 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
