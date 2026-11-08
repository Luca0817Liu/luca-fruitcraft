import React, { useState } from 'react';
import {
  Wand2,
  Hammer,
  Sparkles,
  Bomb,
  Flame,
  PlusCircle,
  Infinity as InfinityIcon,
  Crown,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Bot,
  MousePointerClick,
  Crosshair,
  Shuffle,
  Compass,
  Unlock,
  Palette,
  Droplets,
  Layers,
  ArrowRightLeft,
  FastForward,
  Star,
  Activity,
} from 'lucide-react';

export interface CheatsDockProps {
  // Move Hacks
  isInfiniteMoves: boolean;
  onToggleInfiniteMoves: () => void;
  onAddMoves: (count: number) => void;

  // Instant Clears & Wins
  onInstantWin: () => void;
  onFullBoardNova: () => void;
  onRowLaser: () => void;
  onColLaser: () => void;
  onShockwave: () => void;

  // Special Fruit Spawns
  onSpawnRainbow: () => void;
  onSpawnBombRain: () => void;
  onSpawnCrossLaser: () => void;
  onStripedMatrix: () => void;
  onRainbowDuo: () => void;
  onTargetFruitTransmute: () => void;

  // Obstacle Killers
  onInstantMeltIce: () => void;
  onInstantPurgeHoney: () => void;
  isHammerActive: boolean;
  onToggleHammer: () => void;

  // Movement & Rule Benders
  isFreeSwapActive: boolean;
  onToggleFreeSwap: () => void;
  isTeleportSwapActive: boolean;
  onToggleTeleportSwap: () => void;
  isTapToPopActive: boolean;
  onToggleTapToPop: () => void;

  // Auto-Play Movie Bots
  isAutoPlayActive: boolean;
  onToggleAutoPlay: () => void;
  isTurboAutoPlay: boolean;
  onToggleTurboAutoPlay: () => void;

  // God Modes & Global Hacks
  isGodMode: boolean;
  onToggleGodMode: () => void;
  onLuckyShuffle: () => void;
  onMaxStickers: () => void;
  onMaxJuice: () => void;
  onUnlockAllLevels: () => void;
  onUnlockAllSkins: () => void;
  onOneClickAllGod: () => void;
}

type CategoryTab = 'all' | 'clear' | 'fruits' | 'obstacles' | 'auto' | 'rules' | 'unlocks';

export const CheatsDock: React.FC<CheatsDockProps> = ({
  isInfiniteMoves,
  onToggleInfiniteMoves,
  onAddMoves,
  onInstantWin,
  onFullBoardNova,
  onRowLaser,
  onColLaser,
  onShockwave,
  onSpawnRainbow,
  onSpawnBombRain,
  onSpawnCrossLaser,
  onStripedMatrix,
  onRainbowDuo,
  onTargetFruitTransmute,
  onInstantMeltIce,
  onInstantPurgeHoney,
  isHammerActive,
  onToggleHammer,
  isFreeSwapActive,
  onToggleFreeSwap,
  isTeleportSwapActive,
  onToggleTeleportSwap,
  isTapToPopActive,
  onToggleTapToPop,
  isAutoPlayActive,
  onToggleAutoPlay,
  isTurboAutoPlay,
  onToggleTurboAutoPlay,
  isGodMode,
  onToggleGodMode,
  onLuckyShuffle,
  onMaxStickers,
  onMaxJuice,
  onUnlockAllLevels,
  onUnlockAllSkins,
  onOneClickAllGod,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');

  const categories: { id: CategoryTab; label: string; icon: string }[] = [
    { id: 'all', label: '全部特权 (30)', icon: '⚡' },
    { id: 'clear', label: '暴力清屏', icon: '💥' },
    { id: 'fruits', label: '神果召唤', icon: '🍉' },
    { id: 'obstacles', label: '地形秒杀', icon: '🔨' },
    { id: 'auto', label: '挂机看电影', icon: '🤖' },
    { id: 'rules', label: '规则颠覆', icon: '🪄' },
    { id: 'unlocks', label: '存档拉满', icon: '🎁' },
  ];

  return (
    <div className="absolute top-12 left-2 z-30 pointer-events-auto flex flex-col items-start gap-1.5 select-none max-w-[96vw]">
      {/* Prominent Quick-Action Cheat Ribbon (Always visible & direct 1-click) */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl shadow-xl">
        {/* Toggle Menu Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isExpanded
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 text-white hover:brightness-110 shadow-lg shadow-purple-500/20'
          }`}
          title="展开全部 30 大解压开挂神技特权"
        >
          <Zap className="w-4 h-4 fill-current text-amber-200" />
          <span className="font-extrabold">开挂大全</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] px-1 py-0.2 rounded-md font-black">
            30
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* 1-Click: AI Auto-Play Bot */}
        <button
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isAutoPlayActive
              ? 'bg-emerald-500 text-slate-950 animate-pulse shadow-lg shadow-emerald-500/30'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-emerald-300'
          }`}
          title="开启/关闭 AI 自动消除挂（看电影自动挂机代打）"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">自动消</span>
          <span>{isAutoPlayActive ? '挂机中' : '自动挂'}</span>
        </button>

        {/* 1-Click: Tap-To-Pop God Strike */}
        <button
          onClick={onToggleTapToPop}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isTapToPopActive
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
              : 'bg-slate-800/80 hover:bg-amber-500/20 text-amber-300'
          }`}
          title="点哪消哪：鼠标点击任意水果直接粉碎并引爆同色水果！"
        >
          <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
          <span>点消挂</span>
        </button>

        {/* 1-Click: Full Nova Wipe */}
        <button
          onClick={onFullBoardNova}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 font-bold text-xs border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
          title="一键引爆全屏所有水果与障碍物"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>大清屏</span>
        </button>

        {/* 1-Click: Spawn Rainbows */}
        <button
          onClick={onSpawnRainbow}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-pink-500/20 text-pink-300 hover:text-pink-200 font-bold text-xs border border-white/5 hover:border-pink-500/30 transition-all cursor-pointer active:scale-95"
          title="立刻变出满屏七彩极光彩虹果"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>彩虹果</span>
        </button>

        {/* 1-Click: Free Swap Wand */}
        <button
          onClick={onToggleFreeSwap}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isFreeSwapActive
              ? 'bg-purple-500/40 border border-purple-400 text-purple-200'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-purple-300'
          }`}
          title="自由对换：无视三消规则随意对调任何水果"
        >
          <Wand2 className="w-3.5 h-3.5 text-purple-400" />
          <span>{isFreeSwapActive ? '自由移:开' : '自由移'}</span>
        </button>

        {/* 1-Click: Infinite Moves */}
        <button
          onClick={onToggleInfiniteMoves}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isInfiniteMoves
              ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="切换无限步数模式（步数永不减少）"
        >
          <InfinityIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isInfiniteMoves ? '无限' : '限步'}</span>
        </button>

        {/* 1-Click: Instant Win */}
        <button
          onClick={onInstantWin}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer hover:brightness-110 active:scale-95"
          title="一秒三星通关并自动领取奖励"
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>秒通关</span>
        </button>
      </div>

      {/* Floating Active Alerts */}
      {(isAutoPlayActive ||
        isTurboAutoPlay ||
        isTapToPopActive ||
        isHammerActive ||
        isFreeSwapActive ||
        isTeleportSwapActive ||
        isGodMode) && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1 bg-slate-950/85 backdrop-blur-md rounded-xl border border-white/10 text-[11px] shadow-md">
          {isAutoPlayActive && (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
              <span>🤖 自动消除挂运行中...</span>
              <button
                onClick={onToggleAutoPlay}
                className="underline hover:text-white cursor-pointer ml-0.5"
              >
                [停止]
              </button>
            </span>
          )}
          {isTurboAutoPlay && (
            <span className="text-cyan-300 flex items-center gap-1 font-semibold">
              <span>⚡ 极速代打(3x)</span>
            </span>
          )}
          {isTapToPopActive && (
            <span className="text-amber-300 flex items-center gap-1 font-semibold animate-bounce">
              <span>💥 点哪消哪模式已开：点击屏幕任意水果直接爆破！</span>
              <button
                onClick={onToggleTapToPop}
                className="underline hover:text-white cursor-pointer ml-0.5"
              >
                [关闭]
              </button>
            </span>
          )}
          {isHammerActive && (
            <span className="text-amber-300 flex items-center gap-1 font-semibold">
              <span>🔨 锤子已锁定：点击盘面粉碎</span>
              <button
                onClick={onToggleHammer}
                className="underline hover:text-white cursor-pointer ml-0.5"
              >
                [取消]
              </button>
            </span>
          )}
          {isTeleportSwapActive && (
            <span className="text-blue-300 flex items-center gap-1 font-semibold">
              <span>🛸 超时空全屏对调中</span>
            </span>
          )}
          {isFreeSwapActive && (
            <span className="text-purple-300 flex items-center gap-1 font-semibold">
              <span>🪄 自由对换中</span>
            </span>
          )}
          {isGodMode && (
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <span>⚡ 狂暴开挂模式</span>
            </span>
          )}
        </div>
      )}

      {/* Expanded Super God 30 Cheats Drawer */}
      {isExpanded && (
        <div className="w-[360px] sm:w-[460px] max-w-[94vw] max-h-[75vh] overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl shadow-2xl flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-slate-950/50">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>30 大超级开挂特权库（休闲解压至尊版）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOneClickAllGod}
                className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-black text-[10px] hover:brightness-110 cursor-pointer shadow-sm"
                title="一键同时开启全部神级作弊与无限资源"
              >
                🌟 一键全开
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto scrollbar-none bg-slate-950/30">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Cheats Grid Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
            {/* CATEGORY: 暴力清屏 & 秒杀 */}
            {(activeTab === 'all' || activeTab === 'clear') && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase block">
                  💥 暴力清屏与瞬杀特权
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* 1. Instant Win */}
                  <button
                    onClick={onInstantWin}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-800/80 hover:bg-slate-800 border border-amber-500/30 flex items-center gap-2 cursor-pointer text-left group"
                  >
                    <Crown className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold block text-[11px] text-amber-300">
                        1. 一秒三星通关
                      </span>
                      <span className="text-[9px] text-slate-400">直通结算并拿满奖励</span>
                    </div>
                  </button>

                  {/* 2. Full Nova Wipe */}
                  <button
                    onClick={onFullBoardNova}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-800/80 hover:bg-slate-800 border border-rose-500/30 flex items-center gap-2 cursor-pointer text-left group"
                  >
                    <Flame className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold block text-[11px] text-rose-300">
                        2. 宇宙全屏大清屏
                      </span>
                      <span className="text-[9px] text-slate-400">全场粒子天罚轰炸换新</span>
                    </div>
                  </button>

                  {/* 3. Tap-To-Pop God Strike */}
                  <button
                    onClick={onToggleTapToPop}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isTapToPopActive
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">
                        3. 点哪消哪 (神之触点)
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {isTapToPopActive ? '已开启 (点任意水果爆全屏同色)' : '点击任意水果直接粉碎'}
                      </span>
                    </div>
                  </button>

                  {/* 4. Row Laser */}
                  <button
                    onClick={onRowLaser}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">4. 横扫千军 (横排光束)</span>
                      <span className="text-[9px] text-slate-400">瞬间贯穿消除全盘横行</span>
                    </div>
                  </button>

                  {/* 5. Col Laser */}
                  <button
                    onClick={onColLaser}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <FastForward className="w-4 h-4 text-blue-400 shrink-0 rotate-90" />
                    <div>
                      <span className="font-bold block text-[11px]">5. 竖向贯穿 (纵列光束)</span>
                      <span className="text-[9px] text-slate-400">瞬间贯穿消除全盘竖列</span>
                    </div>
                  </button>

                  {/* 6. Shockwave */}
                  <button
                    onClick={onShockwave}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">6. 全屏震荡波</span>
                      <span className="text-[9px] text-slate-400">棋盘四角与中心同时引爆</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: 特殊水果召唤 */}
            {(activeTab === 'all' || activeTab === 'fruits') && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-pink-400 tracking-wider uppercase block">
                  🍉 神级水果召唤特权
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* 7. Spawn Rainbows */}
                  <button
                    onClick={onSpawnRainbow}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-pink-400/40"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">7. 满屏七彩极光</span>
                      <span className="text-[9px] text-slate-400">随机变出 8 颗彩虹神果</span>
                    </div>
                  </button>

                  {/* 8. Bomb Storm Rain */}
                  <button
                    onClick={onSpawnBombRain}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-rose-400/40"
                  >
                    <Bomb className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">8. 狂轰滥炸地毯炸弹</span>
                      <span className="text-[9px] text-slate-400">散播 8 颗范围爆破炸弹</span>
                    </div>
                  </button>

                  {/* 9. Cross Laser Rain */}
                  <button
                    onClick={onSpawnCrossLaser}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-amber-400/40"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">9. 十字激光天罚</span>
                      <span className="text-[9px] text-slate-400">生成 8 颗十字穿透果</span>
                    </div>
                  </button>

                  {/* 10. Striped Matrix */}
                  <button
                    onClick={onStripedMatrix}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">10. 条纹激光矩阵</span>
                      <span className="text-[9px] text-slate-400">全场水果转为条纹光束</span>
                    </div>
                  </button>

                  {/* 11. Rainbow Duo */}
                  <button
                    onClick={onRainbowDuo}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">11. 彩虹双子星</span>
                      <span className="text-[9px] text-slate-400">放置两颗紧邻彩虹直接清屏</span>
                    </div>
                  </button>

                  {/* 12. Target Fruit Transmute */}
                  <button
                    onClick={onTargetFruitTransmute}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <Droplets className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">12. 目标强运转化</span>
                      <span className="text-[9px] text-slate-400">转出大量通关所需指定水果</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: 地形与障碍秒杀 */}
            {(activeTab === 'all' || activeTab === 'obstacles') && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block">
                  🔨 地形与障碍秒杀特权
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* 13. Melt All Ice */}
                  <button
                    onClick={onInstantMeltIce}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-cyan-400/40"
                  >
                    <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">13. 绝对零度·全破冰</span>
                      <span className="text-[9px] text-slate-400">瞬间融碎全盘所有厚冰块</span>
                    </div>
                  </button>

                  {/* 14. Purge All Honey */}
                  <button
                    onClick={onInstantPurgeHoney}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-amber-400/40"
                  >
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">14. 甜蜜终结·全清蜜罐</span>
                      <span className="text-[9px] text-slate-400">瞬间击碎全盘所有蜜罐方块</span>
                    </div>
                  </button>

                  {/* 15. Magic Hammer */}
                  <button
                    onClick={onToggleHammer}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isHammerActive
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <Hammer className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">15. 魔法粉碎神锤</span>
                      <span className="text-[9px] text-slate-400">
                        {isHammerActive ? '已就绪 (点击任意方块碎裂)' : '精准敲碎任意指定格子'}
                      </span>
                    </div>
                  </button>

                  {/* 16. Lucky Shuffle */}
                  <button
                    onClick={onLuckyShuffle}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <Shuffle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">16. 幸运神之重洗</span>
                      <span className="text-[9px] text-slate-400">重洗盘面并必出 4 连与 5 连</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: 自动挂机看电影 */}
            {(activeTab === 'all' || activeTab === 'auto') && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">
                  🤖 挂机托管 & 看电影专属特权
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* 17. Auto-Play Bot */}
                  <button
                    onClick={onToggleAutoPlay}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isAutoPlayActive
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">17. 看电影自动消除挂</span>
                      <span className="text-[9px] text-slate-400">
                        {isAutoPlayActive ? '运行中 (边看电影边自动过关)' : '智能连消+自动下一关'}
                      </span>
                    </div>
                  </button>

                  {/* 18. Turbo Auto-Play */}
                  <button
                    onClick={onToggleTurboAutoPlay}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isTurboAutoPlay
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <FastForward className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">18. 3x 极速代打挂</span>
                      <span className="text-[9px] text-slate-400">
                        {isTurboAutoPlay ? '已开启 (3倍速狂暴爆破)' : '超高频光速自动消除'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: 规则颠覆 & 步数锁定 */}
            {(activeTab === 'all' || activeTab === 'rules') && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase block">
                  🪄 规则颠覆 & 移动特权
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* 19. Free Swap Wand */}
                  <button
                    onClick={onToggleFreeSwap}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isFreeSwapActive
                        ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">19. 自由对换棒</span>
                      <span className="text-[9px] text-slate-400">
                        {isFreeSwapActive ? '生效中 (无需成三连随便换)' : '任意相邻直接调换'}
                      </span>
                    </div>
                  </button>

                  {/* 20. Teleport Global Swap */}
                  <button
                    onClick={onToggleTeleportSwap}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isTeleportSwapActive
                        ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">20. 超时空全屏对调</span>
                      <span className="text-[9px] text-slate-400">
                        {isTeleportSwapActive ? '生效中 (点天南海北两颗对换)' : '全盘任意两点瞬移交换'}
                      </span>
                    </div>
                  </button>

                  {/* 21. Infinite Moves */}
                  <button
                    onClick={onToggleInfiniteMoves}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isInfiniteMoves
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <InfinityIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">21. 无限步数永动机</span>
                      <span className="text-[9px] text-slate-400">
                        {isInfiniteMoves ? '步数锁定无限' : '步数永不消耗'}
                      </span>
                    </div>
                  </button>

                  {/* 22. Add 30 Moves */}
                  <button
                    onClick={() => onAddMoves(30)}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">22. 步数大礼包 (+30)</span>
                      <span className="text-[9px] text-slate-400">立刻追加 30 步充足步数</span>
                    </div>
                  </button>

                  {/* 23. Add 100 Moves */}
                  <button
                    onClick={() => onAddMoves(100)}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200"
                  >
                    <PlusCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">23. 步数巨无霸 (+100)</span>
                      <span className="text-[9px] text-slate-400">海量步数尽情消除</span>
                    </div>
                  </button>

                  {/* 24. God Mode */}
                  <button
                    onClick={onToggleGodMode}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-left ${
                      isGodMode
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-white/5 text-slate-200'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 fill-current" />
                    <div>
                      <span className="font-bold block text-[11px]">24. 狂暴超神开挂模式</span>
                      <span className="text-[9px] text-slate-400">
                        {isGodMode ? '超神中 (每消生炸弹+神罚破)' : '开启无敌每消必爆'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: 存档全拉满 */}
            {(activeTab === 'all' || activeTab === 'unlocks') && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block">
                  🎁 存档拉满 & 永久全解锁特权
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* 25. Max Stickers */}
                  <button
                    onClick={onMaxStickers}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-amber-400/40"
                  >
                    <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
                    <div>
                      <span className="font-bold block text-[11px]">25. 水果贴纸全套拉满</span>
                      <span className="text-[9px] text-slate-400">全部 8 种水果贴纸各送 99 张</span>
                    </div>
                  </button>

                  {/* 26. Max Juice */}
                  <button
                    onClick={onMaxJuice}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-pink-400/40"
                  >
                    <Droplets className="w-4 h-4 text-pink-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">26. 果汁星星无限灌装</span>
                      <span className="text-[9px] text-slate-400">立刻获得 88,888 果汁瓶</span>
                    </div>
                  </button>

                  {/* 27. Unlock All Levels */}
                  <button
                    onClick={onUnlockAllLevels}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-emerald-400/40"
                  >
                    <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">27. 全关卡图鉴通通解锁</span>
                      <span className="text-[9px] text-slate-400">
                        解锁全部主线+秘境+彩蛋关
                      </span>
                    </div>
                  </button>

                  {/* 28. Unlock All Skins */}
                  <button
                    onClick={onUnlockAllSkins}
                    className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-white/5 flex items-center gap-2 cursor-pointer text-left text-slate-200 hover:border-purple-400/40"
                  >
                    <Palette className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-[11px]">28. 全套 3D 棋盘皮肤解锁</span>
                      <span className="text-[9px] text-slate-400">星空/珊瑚/樱花/冰晶全畅玩</span>
                    </div>
                  </button>

                  {/* 29. Instant 3-Star Mainline */}
                  <button
                    onClick={onOneClickAllGod}
                    className="col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-amber-900/60 border border-purple-400/50 flex items-center gap-2 cursor-pointer text-left hover:brightness-110"
                  >
                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
                    <div>
                      <span className="font-extrabold block text-[11px] text-yellow-200">
                        30. 【至尊全开·神级飞升】一键拉满所有模式
                      </span>
                      <span className="text-[9px] text-slate-300">
                        开启自动代打 + 无限步数 + 自由瞬移对调 + 点消挂 + 贴纸金币全拉满！
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
