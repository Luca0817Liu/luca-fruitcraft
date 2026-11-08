import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SecretUnlockToastProps {
  levelName: string;
  onClose: () => void;
}

export const SecretUnlockToast: React.FC<SecretUnlockToastProps> = ({
  levelName,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-purple-500/40 text-purple-200 shadow-2xl">
        <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
        <div className="flex flex-col text-left">
          <span className="text-[11px] text-purple-300 font-medium">
            触碰奇迹 · 发现独立 3D 秘境
          </span>
          <span className="text-xs font-bold text-white">
            「{levelName}」已悄然收录至图鉴
          </span>
        </div>
      </div>
    </div>
  );
};
