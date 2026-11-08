import React, { useState } from 'react';
import { X, Lock, Star, Sparkles, Compass } from 'lucide-react';
import { LevelConfig, LevelRecord } from '../types/game';

interface LevelSelectModalProps {
  levels: LevelConfig[];
  currentLevelId: string;
  unlockedLevelIds: string[];
  records: Record<string, LevelRecord>;
  onSelectLevel: (levelId: string) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentLevelId,
  unlockedLevelIds,
  records,
  onSelectLevel,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'hidden' | 'easter_egg'>('main');

  const filteredLevels = levels.filter((lvl) => lvl.category === activeTab);

  const getThemeBadge = (theme: string) => {
    switch (theme) {
      case 'spring': return '🌱 春日绿意';
      case 'ice': return '❄️ 冰晶寒境';
      case 'honey': return '🍯 蜜意雨林';
      case 'portal': return '🌀 空间溪谷';
      case 'rainbow': return '🌈 彩虹极光';
      case 'starlight': return '✨ 星光微澜';
      case 'cloud': return '☁️ 浮空云海';
      case 'sakura': return '🌸 粉樱微风';
      case 'night': return '🌙 星夜萤火';
      case 'coral': return '🪸 深海珊瑚';
      default: return '🍃 果园';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">3D 关卡与秘境图鉴</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/5 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('main')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'main'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            主线关卡 (5)
          </button>
          <button
            onClick={() => setActiveTab('hidden')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hidden'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>差异化 3D 隐藏秘境 (5)</span>
          </button>
          <button
            onClick={() => setActiveTab('easter_egg')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'easter_egg'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            彩蛋迷你棋盘 (3)
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredLevels.map((lvl) => {
            const isUnlocked = unlockedLevelIds.includes(lvl.id);
            const isCurrent = lvl.id === currentLevelId;
            const rec = records[lvl.id];
            const stars = rec ? rec.stars : 0;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
                className={`relative rounded-2xl p-4 border transition-all text-left flex flex-col justify-between ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-white/5 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 cursor-pointer'
                    : 'bg-slate-800/40 hover:bg-slate-800/70 border-white/10 cursor-pointer hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-medium text-slate-400">
                      {getThemeBadge(lvl.theme)}
                    </span>
                    {/* Stars */}
                    {isUnlocked ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>未解锁</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-0.5">
                    {lvl.name}
                  </h3>
                  <p className="text-xs text-slate-300 mb-2">
                    {lvl.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-slate-300">
                      <span>{lvl.rows}x{lvl.cols} 棋盘 · {lvl.moves} 步</span>
                      {rec && rec.highScore > 0 && (
                        <span className="text-amber-300 font-semibold tabular-nums">
                          高分 {rec.highScore}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-amber-400/80">
                      <span>解锁要求：{lvl.unlockCondition}</span>
                    </div>
                  )}
                  {lvl.rewardDescription && (
                    <div className="mt-1 text-[10px] text-slate-400 truncate">
                      🎁 {lvl.rewardDescription}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
