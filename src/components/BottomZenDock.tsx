import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Palette, Monitor, BookOpen } from 'lucide-react';
import { BoardSkin } from '../types/game';

interface BottomZenDockProps {
  speed: number;
  onSetSpeed: (speed: number) => void;
  boardSkin: BoardSkin;
  onSetBoardSkin: (skin: BoardSkin) => void;
  quality: 'high' | 'medium' | 'low';
  onSetQuality: (q: 'high' | 'medium' | 'low') => void;
  onGetHint: () => void;
  canHint: boolean;
  onOpenManual?: () => void;
}

export const BottomZenDock: React.FC<BottomZenDockProps> = ({
  speed,
  onSetSpeed,
  boardSkin,
  onSetBoardSkin,
  quality,
  onSetQuality,
  onGetHint,
  canHint,
  onOpenManual,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const skins: { id: BoardSkin; label: string }[] = [
    { id: 'wood', label: '原木' },
    { id: 'ice', label: '冰晶' },
    { id: 'sakura', label: '樱花' },
    { id: 'starlight', label: '星空' },
    { id: 'coral', label: '珊瑚' },
  ];

  const speeds = [
    { val: 0.7, label: '0.7x 慢速解压' },
    { val: 1.0, label: '1.0x 标准' },
    { val: 1.4, label: '1.4x 爽快' },
  ];

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto transition-transform duration-300">
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-3 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-t-xl border border-b-0 border-white/10 text-xs flex items-center gap-1 shadow-md cursor-pointer mb-[-1px]"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>解压工具箱</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>收起面板</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-[94vw] text-slate-200">
          {/* Hint Button */}
          <button
            onClick={onGetHint}
            disabled={!canHint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 rounded-xl border border-amber-500/30 text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
            title="提示可行消除位置"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>找提示</span>
          </button>

          {/* Manual / Guide Button */}
          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-white/10 text-xs font-medium cursor-pointer transition-colors"
              title="查看玩法说明书"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">说明书</span>
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-black/30 rounded-xl border border-white/5 text-xs">
            {speeds.map((s) => (
              <button
                key={s.val}
                onClick={() => onSetSpeed(s.val)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  Math.abs(speed - s.val) < 0.05
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Board Skin Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-black/30 rounded-xl border border-white/5 text-xs">
            <span className="text-[10px] text-slate-400 px-1 flex items-center gap-0.5">
              <Palette className="w-3 h-3" />
            </span>
            {skins.map((sk) => (
              <button
                key={sk.id}
                onClick={() => onSetBoardSkin(sk.id)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  boardSkin === sk.id
                    ? 'bg-amber-400/20 text-amber-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sk.label}
              </button>
            ))}
          </div>

          {/* Quality Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-black/30 rounded-xl border border-white/5 text-xs">
            <span className="text-[10px] text-slate-400 px-1 flex items-center gap-0.5">
              <Monitor className="w-3 h-3" />
            </span>
            {(['high', 'medium', 'low'] as const).map((q) => (
              <button
                key={q}
                onClick={() => onSetQuality(q)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  quality === q
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {q === 'high' ? '高画质' : q === 'medium' ? '中' : '省电'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
