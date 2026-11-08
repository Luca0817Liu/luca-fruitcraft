import React from 'react';
import { X, Volume2, BookOpen, HelpCircle, RotateCcw } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onOpenManual?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onOpenManual,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/40">
          <h2 className="text-lg font-bold text-white tracking-wide">
            设置与操作指南
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-xs text-slate-300">
          {/* Audio Controls */}
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>音频调节</span>
            </h3>

            {/* Sound FX */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">消除音效</span>
              <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) =>
                    onUpdateSettings({ soundVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <button
                  onClick={() =>
                    onUpdateSettings({ soundEnabled: !settings.soundEnabled })
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                    settings.soundEnabled
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? '开' : '关'}
                </button>
              </div>
            </div>

            {/* Ambient Music */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">背景治愈旋律</span>
              <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) =>
                    onUpdateSettings({ musicVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <button
                  onClick={() =>
                    onUpdateSettings({ musicEnabled: !settings.musicEnabled })
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                    settings.musicEnabled
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {settings.musicEnabled ? '开' : '关'}
                </button>
              </div>
            </div>
          </div>

          {/* Full Manual Banner Button */}
          {onOpenManual && (
            <button
              onClick={() => {
                onClose();
                onOpenManual();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/30 text-amber-200 flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <div className="text-left">
                  <span className="font-bold text-white block">查阅完整 3D 游戏说明书</span>
                  <span className="text-[10px] text-slate-300">包含全套特殊水果连携、障碍机制与隐藏秘境解锁攻略</span>
                </div>
              </div>
              <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          )}

          {/* Controls Instruction */}
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-2.5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>操作方式</span>
            </h3>
            <ul className="space-y-1.5 text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-200">电脑端：</strong>
                按住鼠标向相邻水果滑动即可交换；亦可单击选中水果，再点击相邻格子。按 P 键暂停。
              </li>
              <li>
                <strong className="text-slate-200">手机/平板端：</strong>
                手指直接滑动相邻水果交换，或轻触选中后再点目标格子。
              </li>
            </ul>
          </div>

          {/* Special Fruit Synthesis Guide */}
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
            <h3 className="font-semibold text-white">合成水果秘籍</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-amber-300 font-bold">⚡ 四消 · 条纹果</span>
                <p className="text-slate-400 mt-0.5">扫荡整行或整列</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-rose-400 font-bold">💣 L/T 型 · 炸弹果</span>
                <p className="text-slate-400 mt-0.5">消除周围 3x3 区域</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-purple-400 font-bold">✨ 十字消 · 十字果</span>
                <p className="text-slate-400 mt-0.5">十字全范围贯穿</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-cyan-400 font-bold">🌈 五消直线 · 彩虹果</span>
                <p className="text-slate-400 mt-0.5">交换消除全场同类水果</p>
              </div>
            </div>
          </div>

          {/* Reset Progress */}
          <div className="pt-2 flex justify-between items-center text-slate-400">
            <span>存档管理</span>
            <button
              onClick={() => {
                if (window.confirm('确定要重置所有关卡与贴纸进度吗？')) {
                  onResetProgress();
                }
              }}
              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重置进度</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
