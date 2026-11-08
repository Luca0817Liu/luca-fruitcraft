import React from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { FRUIT_STICKER_INFO } from '../game/storage';

interface StickerBookModalProps {
  stickers: Record<string, number>;
  totalJuice: number;
  onClose: () => void;
}

export const StickerBookModal: React.FC<StickerBookModalProps> = ({
  stickers,
  totalJuice,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              水果贴纸手账
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
              <span>🧃 果汁余量</span>
              <span className="tabular-nums">{totalJuice}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sticker Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(FRUIT_STICKER_INFO).map(([key, info]) => {
            const count = stickers[key] || 0;
            const isUnlocked = count > 0;

            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/50 border-white/10 hover:border-amber-400/30'
                    : 'bg-slate-950/30 border-white/5 opacity-40'
                }`}
              >
                <div className="text-3xl mb-1.5 filter drop-shadow">
                  {info.icon}
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">
                  {info.name}
                </h4>
                <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                  {info.desc}
                </p>
                <div className="mt-auto px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-medium text-slate-300">
                  {isUnlocked ? `已收集 x${count}` : '未发现'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 border-t border-white/5 bg-slate-900/60 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>在任意对局中完成大消除与通关，即可随机掉落稀有贴纸</span>
        </div>
      </div>
    </div>
  );
};
