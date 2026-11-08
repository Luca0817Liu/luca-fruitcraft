import React from 'react';
import { LevelTarget, FruitType } from '../types/game';
import { FRUIT_STICKER_INFO } from '../game/storage';

interface MiniHUDProps {
  targets: LevelTarget[];
  movesLeft: number;
  score: number;
  combo: number;
  isInfiniteMoves?: boolean;
}

export const MiniHUD: React.FC<MiniHUDProps> = ({
  targets,
  movesLeft,
  score,
  combo,
  isInfiniteMoves,
}) => {
  const getTargetIcon = (target: LevelTarget) => {
    if (target.type === 'fruit' && target.fruitType) {
      return FRUIT_STICKER_INFO[target.fruitType]?.icon || '🍎';
    }
    if (target.type === 'ice') return '🧊';
    if (target.type === 'honey') return '🍯';
    return '⭐';
  };

  return (
    <div className="absolute top-12 right-2 z-10 pointer-events-none select-none flex flex-col items-end gap-1.5">
      {/* Compact Mini Float Panel */}
      <div className="pointer-events-auto bg-slate-900/75 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 shadow-lg flex flex-col gap-2 min-w-[124px]">
        {/* Moves Left Counter */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1.5">
          <span className="text-[11px] font-medium text-slate-300">剩余步数</span>
          <span
            className={`text-base font-bold tabular-nums ${
              isInfiniteMoves
                ? 'text-emerald-400'
                : movesLeft <= 5
                ? 'text-rose-400'
                : 'text-amber-300'
            }`}
          >
            {isInfiniteMoves ? '∞' : movesLeft}
          </span>
        </div>

        {/* Level Targets Grid */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400">通关目标</span>
          <div className="flex flex-wrap gap-1.5">
            {targets.map((tgt, i) => {
              const isDone = tgt.currentCount >= tgt.targetCount;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium tabular-nums ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-200 border border-white/5'
                  }`}
                >
                  <span className="text-xs">{getTargetIcon(tgt)}</span>
                  <span>
                    {isDone ? '✓' : `${tgt.currentCount}/${tgt.targetCount}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-white/5">
          <span>得分</span>
          <span className="font-semibold text-slate-200 tabular-nums">
            {score}
          </span>
        </div>
      </div>

      {/* Joyful combo callout if combo > 1 */}
      {combo > 1 && (
        <div className="bg-amber-500/90 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md animate-bounce flex items-center gap-1">
          <span>✨ 连锁 x{combo}</span>
        </div>
      )}
    </div>
  );
};
