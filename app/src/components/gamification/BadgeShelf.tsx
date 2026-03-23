import { useState } from 'react';
import { getAllBadges, getRarityColor } from '../../lib/xp';
import type { Badge, BadgeRarity } from '../../types';

interface BadgeShelfProps {
  earnedBadgeIds: string[];
}

const RARITY_ORDER: BadgeRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

function rarityIndex(r: BadgeRarity): number {
  return RARITY_ORDER.indexOf(r);
}

export default function BadgeShelf({ earnedBadgeIds }: BadgeShelfProps) {
  const allBadges = getAllBadges();
  const earnedSet = new Set(earnedBadgeIds);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Sort: earned first, then by rarity (legendary first)
  const sorted = [...allBadges].sort((a, b) => {
    const aEarned = earnedSet.has(a.id) ? 0 : 1;
    const bEarned = earnedSet.has(b.id) ? 0 : 1;
    if (aEarned !== bEarned) return aEarned - bEarned;
    return rarityIndex(a.rarity) - rarityIndex(b.rarity);
  });

  const earnedCount = earnedBadgeIds.length;
  const totalCount = allBadges.length;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-white/70">הישגים</span>
        <span className="text-xs text-white/40">{earnedCount}/{totalCount}</span>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-5 gap-2">
        {sorted.map((badge) => {
          const isEarned = earnedSet.has(badge.id);
          const color = getRarityColor(badge.rarity);

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                transition-all duration-200 hover:scale-110
                ${isEarned
                  ? 'badge-earned'
                  : 'grayscale opacity-40 bg-white/5 border border-white/10'
                }`}
              style={isEarned ? {
                border: `2px solid ${color}`,
                boxShadow: `0 0 8px ${color}40`,
              } : undefined}
              title={isEarned ? badge.name : '?'}
            >
              {isEarned ? badge.emoji : '?'}
            </button>
          );
        })}
      </div>

      {/* Detail overlay */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm badge-detail-enter"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6
              max-w-xs w-full mx-4 text-center badge-detail-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-5xl mb-3 mx-auto"
              style={{
                filter: earnedSet.has(selectedBadge.id) ? 'none' : 'grayscale(1)',
              }}
            >
              {selectedBadge.emoji}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {selectedBadge.name}
            </h3>
            <p className="text-sm text-white/60 mb-2">
              {selectedBadge.description}
            </p>
            <div
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: `${getRarityColor(selectedBadge.rarity)}20`,
                color: getRarityColor(selectedBadge.rarity),
                border: `1px solid ${getRarityColor(selectedBadge.rarity)}40`,
              }}
            >
              {selectedBadge.rarity}
            </div>
            {!earnedSet.has(selectedBadge.id) && (
              <p className="text-xs text-white/30 mt-3">
                {selectedBadge.unlockCondition}
              </p>
            )}
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm
                hover:bg-white/20 transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      <style>{`
        .badge-earned {
          animation: badge-glow 3s ease-in-out infinite;
        }
        @keyframes badge-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        .badge-detail-enter {
          animation: badge-overlay-in 0.2s ease-out;
        }
        .badge-detail-card {
          animation: badge-card-in 0.3s ease-out;
        }
        @keyframes badge-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes badge-card-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
