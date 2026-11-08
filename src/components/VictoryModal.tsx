import React from 'react';
import { Star, RotateCcw, ArrowRight, Map, Sparkles } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface VictoryModalProps {
  isWin: boolean;
  level: LevelConfig;
  stars: number;
  score: number;
  movesLeft: number;
  juiceEarned: number;
  droppedSticker?: { name: string; icon: string };
  unlockedSecretLevelName?: string;
  onNextLevel?: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isWin,
  level,
  stars,
  score,
  movesLeft,
  juiceEarned,
  droppedSticker,
  unlockedSecretLevelName,
  onNextLevel,
  onRestart,
  onOpenLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        {isWin ? (
          <>
            {/* Joyful Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`p-1.5 rounded-full transition-transform ${
                    s <= stars
                      ? 'text-amber-400 scale-110'
                      : 'text-slate-600'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current drop-shadow" />
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              顺利通关！
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              {level.name} · 完美达成目标
            </p>

            {/* Secret Level Unlock Banner if triggered */}
            {unlockedSecretLevelName && (
              <div className="w-full bg-purple-950/70 border border-purple-500/40 rounded-2xl p-3 mb-4 text-purple-200 text-xs flex items-center gap-2.5 shadow-md">
                <Sparkles className="w-5 h-5 text-purple-300 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-amber-300 block">
                    唤醒全新 3D 隐藏秘境！
                  </span>
                  <span>「{unlockedSecretLevelName}」已在图鉴中解锁</span>
                </div>
              </div>
            )}

            {/* Score & Rewards Box */}
            <div className="w-full bg-slate-800/60 border border-white/5 rounded-2xl p-3 mb-5 flex justify-around text-xs">
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-[11px]">本局得分</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {score}
                </span>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-[11px]">剩余步数</span>
                <span className="text-base font-bold text-amber-300 tabular-nums">
                  +{movesLeft}
                </span>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-[11px]">果汁收益</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  +{juiceEarned} 🧃
                </span>
              </div>
            </div>

            {/* Sticker drop notification */}
            {droppedSticker && (
              <div className="mb-4 text-xs text-slate-300 flex items-center justify-center gap-1.5">
                <span>收获贴纸：</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/10 font-medium text-amber-200">
                  {droppedSticker.icon} {droppedSticker.name}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex items-center gap-2.5">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重玩</span>
              </button>

              {onNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="flex-[2] py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>下一关</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-2xl">
              🍃
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              步数用完啦
            </h2>
            <p className="text-xs text-slate-300 mb-5 max-w-[220px]">
              深呼吸放松一下，三消讲究节奏与布局，随时重新开启舒缓对局
            </p>

            <div className="w-full flex items-center gap-2.5">
              <button
                onClick={onOpenLevelSelect}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>换一关</span>
              </button>
              <button
                onClick={onRestart}
                className="flex-[2] py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重新开局</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
