import React from 'react';
import { Volume2, VolumeX, BookOpen, Map, Settings, RotateCcw } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface HeaderBarProps {
  currentLevel: LevelConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenManual: () => void;
  onOpenLevels: () => void;
  onOpenStickers: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentLevel,
  soundEnabled,
  onToggleSound,
  onOpenManual,
  onOpenLevels,
  onOpenStickers,
  onOpenSettings,
  onRestart,
}) => {
  return (
    <header className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Brand & Current Level Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-sm text-slate-100 pointer-events-auto">
        <button
          onClick={onOpenLevels}
          className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer group text-left"
          title="点击切换关卡"
        >
          <span className="text-sm font-semibold tracking-wide whitespace-nowrap text-white">
            {currentLevel.name}
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline whitespace-nowrap">
            {currentLevel.category === 'main'
              ? '主线'
              : currentLevel.category === 'hidden'
              ? '秘境'
              : '彩蛋'}
          </span>
          <span className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform">
            ▾
          </span>
        </button>
      </div>

      {/* Right Action Icons: Single-line compact utility buttons */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-sm pointer-events-auto">
        <button
          onClick={onOpenManual}
          className="flex items-center gap-1 px-2 py-1 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
          title="打开游戏说明书"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">说明书</span>
        </button>
        <button
          onClick={onOpenLevels}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="关卡图鉴"
        >
          <Map className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenStickers}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="收集贴纸册"
        >
          <BookOpen className="w-4 h-4" />
        </button>
        <button
          onClick={onRestart}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="重开本关"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleSound}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title={soundEnabled ? '静音' : '开启声音'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="游戏设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
