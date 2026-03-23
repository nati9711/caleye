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
          className="relative w-full max-w-md mx-auto rounded-t-2xl md:rounded-2xl overflow-hidden"
          style={{
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile) */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <div className="p-5">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤔</span>
              <h2 className="text-lg font-bold text-white">לא בטוח לגמרי...</h2>
            </div>

            {/* Detected food info */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-text-secondary text-sm">זיהיתי:</span>
              <span className="text-white font-semibold text-base">{entry.foodHe}</span>
            </div>

            {/* Confidence indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-text-secondary text-sm">ביטחון:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${confidencePct}%`, backgroundColor: confidenceColor }}
                  />
                </div>
                <span className="font-bold text-sm" style={{ color: confidenceColor }}>
                  {confidencePct}%
                </span>
                <span className="text-xs text-text-tertiary">({getConfidenceLabel(entry.confidence)})</span>
              </div>
            </div>

            {/* Thumbnail */}
            {entry.thumbnail && (
              <div className="w-full rounded-xl overflow-hidden mb-4 border border-white/10">
                <img
                  src={entry.thumbnail}
                  alt={entry.foodHe}
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}

            {/* AI question if present */}
            {userQuestion && (
              <div
                className="rounded-xl p-3 mb-4 text-sm"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <span className="text-amber-400 font-medium">🤖 שאלה: </span>
                <span className="text-gray-200">{userQuestion}</span>
              </div>
            )}

            {/* Grams editor */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-sm">כמות משוערת:</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                      className="w-20 px-3 py-1.5 rounded-lg text-white text-sm font-mono text-center"
                      style={{ background: '#0a0e17', border: '1px solid rgba(255,255,255,0.15)' }}
                      dir="ltr"
                      autoFocus
                      min={1}
                      max={5000}
                    />
                    <span className="text-text-secondary text-sm">גרם</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span>{entry.calories > 0 ? `~${Math.round((entry.calories / 2.5))}` : '100'}</span>
                    <span className="text-text-secondary">גרם</span>
                    <span className="text-text-tertiary text-xs mr-1">✏️</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onConfirm(entry)}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: '#22D97F', color: '#0a0e17' }}
              >
                ✅ נכון
              </button>
              <button
                onClick={() => onEdit(entry, grams)}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}
              >
                ✏️ תקן
              </button>
              <button
                onClick={onReject}
                className="px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                ❌
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
