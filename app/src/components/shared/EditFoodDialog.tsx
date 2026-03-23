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
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h2 className="text-lg font-bold text-white">עריכת ארוחה</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white text-xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Food name */}
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-1.5 block">שם</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm"
                style={{ background: '#0a0e17', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Grams */}
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-1.5 block">כמות</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-2.5 rounded-lg text-white text-sm font-mono text-center"
                  style={{ background: '#0a0e17', border: '1px solid rgba(255,255,255,0.1)' }}
                  dir="ltr"
                  min={1}
                  max={5000}
                />
                <span className="text-text-secondary text-sm">גרם</span>
              </div>
            </div>

            {/* Auto-calculated nutrition */}
            <div
              className="rounded-xl p-4 mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm">קלוריות</span>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold text-lg">{calories}</span>
                  <span className="text-text-tertiary text-xs">קק״ל</span>
                  {isRecalculating && (
                    <span className="text-amber-400 text-xs animate-pulse">🔄</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-text-tertiary mb-3">מחושב אוטומטית לפי USDA</div>

              {/* Macro breakdown */}
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <div className="text-macro-protein font-medium">{protein}g</div>
                  <div className="text-text-tertiary text-xs">חלבון</div>
                </div>
                <div className="text-center">
                  <div className="text-macro-carbs font-medium">{carbs}g</div>
                  <div className="text-text-tertiary text-xs">פחמימות</div>
                </div>
                <div className="text-center">
                  <div className="text-macro-fat font-medium">{fat}g</div>
                  <div className="text-text-tertiary text-xs">שומן</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: '#22D97F', color: '#0a0e17' }}
              >
                💾 שמור
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                🗑️ מחק
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
