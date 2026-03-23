import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { FoodEntry } from '../../types';
import { lookupNutrition } from '../../lib/nutrition';

interface EditFoodDialogProps {
  /** The food entry to edit */
  entry: FoodEntry;
  /** Save the edited entry */
  onSave: (updated: FoodEntry) => void;
  /** Delete the entry */
  onDelete: (entryId: string) => void;
  /** Close without saving */
  onClose: () => void;
}

/**
 * Edit dialog for an existing food log entry.
 * User can change food name and grams; calories auto-recalculate from USDA.
 * Bottom sheet on mobile, centered modal on desktop.
 */
export default function EditFoodDialog({
  entry,
  onSave,
  onDelete,
  onClose,
}: EditFoodDialogProps) {
  const [name, setName] = useState(entry.foodHe);
  const [nameEn, setNameEn] = useState(entry.food);
  const [grams, setGrams] = useState(100);
  const [calories, setCalories] = useState(entry.calories);
  const [protein, setProtein] = useState(entry.protein);
  const [carbs, setCarbs] = useState(entry.carbs);
  const [fat, setFat] = useState(entry.fat);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Recalculate nutrition when grams change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (grams <= 0) return;
      setIsRecalculating(true);
      try {
        const data = await lookupNutrition(nameEn, grams);
        if (data && !cancelled) {
          setCalories(data.calories);
          setProtein(data.protein);
          setCarbs(data.carbs);
          setFat(data.fat);
        }
      } catch {
        // Keep existing values on error
      } finally {
        if (!cancelled) setIsRecalculating(false);
      }
    }, 500); // Debounce 500ms

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [grams, nameEn]);

  const handleSave = () => {
    onSave({
      ...entry,
      food: nameEn,
      foodHe: name,
      calories,
      protein,
      carbs,
      fat,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
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
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(34,217,127,0.1)', border: '1px solid rgba(34,217,127,0.15)' }}
                >
                  ✏️
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">עריכת ארוחה</h2>
                  <p className="text-xs text-text-tertiary">עדכן שם וכמות</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-text-tertiary hover:text-white text-lg w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/[0.05] transition-all"
              >
                ✕
              </button>
            </div>

            {/* Food name */}
            <div className="mb-4">
              <label className="text-text-tertiary text-xs mb-2 block font-medium">שם</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm transition-all focus:ring-1 focus:ring-accent/30 focus:outline-none"
                style={{ background: 'rgba(10,14,23,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Grams with +/- buttons */}
            <div className="mb-4">
              <label className="text-text-tertiary text-xs mb-2 block font-medium">כמות</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGrams(Math.max(1, grams - 10))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-text-secondary hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-2.5 rounded-xl text-white text-sm font-mono text-center focus:ring-1 focus:ring-accent/30 focus:outline-none"
                  style={{ background: 'rgba(10,14,23,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  dir="ltr"
                  min={1}
                  max={5000}
                />
                <button
                  onClick={() => setGrams(Math.min(5000, grams + 10))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-text-secondary hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  +
                </button>
                <span className="text-text-tertiary text-sm">גרם</span>
              </div>
            </div>

            {/* Auto-calculated nutrition */}
            <div
              className="rounded-xl p-4 mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-tertiary text-sm">קלוריות</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl tabular-nums font-sora gradient-text-glow">{calories}</span>
                  <span className="text-text-tertiary text-xs">קק״ל</span>
                  {isRecalculating && (
                    <span className="text-amber-400 text-xs animate-pulse">מחשב...</span>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-text-tertiary mb-3">מחושב אוטומטית לפי USDA</div>

              {/* Macro breakdown */}
              <div className="flex justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="text-macro-protein font-bold tabular-nums">{protein}g</div>
                  <div className="text-text-tertiary text-[10px] mt-0.5">חלבון</div>
                </div>
                <div className="w-px bg-white/[0.06] mx-3" />
                <div className="text-center flex-1">
                  <div className="text-macro-carbs font-bold tabular-nums">{carbs}g</div>
                  <div className="text-text-tertiary text-[10px] mt-0.5">פחמימות</div>
                </div>
                <div className="w-px bg-white/[0.06] mx-3" />
                <div className="text-center flex-1">
                  <div className="text-macro-fat font-bold tabular-nums">{fat}g</div>
                  <div className="text-text-tertiary text-[10px] mt-0.5">שומן</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #22D97F, #06B6D4)',
                  color: '#0a0e17',
                  boxShadow: '0 4px 16px rgba(34,217,127,0.2)',
                }}
              >
                שמור
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="px-5 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                מחק
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
