import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Gamepad2,
  Zap,
  ShieldAlert,
  Compass,
  Smile,
  ChevronRight,
  MousePointer,
  Smartphone,
  Star,
  Palette,
  Wand2,
  Hammer,
  Bomb,
  Flame,
  PlusCircle,
  Infinity as InfinityIcon,
  Crown,
} from 'lucide-react';

interface ManualModalProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({
  onClose,
  onOpenLevelSelect,
}) => {
  const [activeSection, setActiveSection] = useState<
    'rules' | 'specials' | 'obstacles' | 'secrets' | 'collection' | 'cheats' | 'zen'
  >('rules');

  const navItems = [
    { id: 'rules' as const, label: '基础操作与规则', icon: Gamepad2 },
    { id: 'specials' as const, label: '特殊水果与连携技', icon: Zap },
    { id: 'cheats' as const, label: '解压开挂神器', icon: Wand2 },
    { id: 'obstacles' as const, label: '立体障碍与机关', icon: ShieldAlert },
    { id: 'secrets' as const, label: '3D 隐藏秘境攻略', icon: Compass },
    { id: 'collection' as const, label: '贴纸手账与底座', icon: Palette },
    { id: 'zen' as const, label: '舒缓解压指南', icon: Smile },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[720px] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>3D 水果消消乐 · 游玩指南说明书</span>
              </h2>
              <p className="text-xs text-slate-400">
                掌握消除手感、特殊水果连携合成与立体隐藏关解锁秘籍
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="关闭说明书"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area with Left Sidebar Navigation on desktop / Top scroll tabs on mobile */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Navigation Tab Bar */}
          <nav className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/40 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer text-left ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight
                    className={`hidden md:block w-3.5 h-3.5 transition-transform ${
                      isActive ? 'opacity-100 translate-x-0.5 text-amber-300' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Detailed Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6 text-xs text-slate-300 leading-relaxed">
            {/* 1. 基础操作与规则 */}
            {activeSection === 'rules' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                    <span>双端操控模式</span>
                  </h3>
                  <p className="text-slate-400">
                    无论是电脑键鼠还是手机平板触摸屏，均经过专门适配与调校，消除丝滑无延迟：
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <MousePointer className="w-4 h-4 text-emerald-400" />
                      <span>电脑端（鼠标与键盘）</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                      <li>
                        <strong className="text-slate-200">滑动拖拽：</strong>
                        按住鼠标左键向相邻水果轻轻滑动，即可直接完成交换。
                      </li>
                      <li>
                        <strong className="text-slate-200">点击选中交换：</strong>
                        左键单击选中一颗水果（水果会放大浮起），再点击相邻格子直接交换。
                      </li>
                      <li>
                        <strong className="text-slate-200">快捷键：</strong>
                        按键盘 <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded font-mono text-[10px] text-amber-300">P</kbd> 键可随时呼出设置菜单。
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <span>手机 / 平板端（触控手势）</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                      <li>
                        <strong className="text-slate-200">单指滑动：</strong>
                        手指按住水果向任意相邻方向轻滑，灵敏触发交换。
                      </li>
                      <li>
                        <strong className="text-slate-200">轻触选中：</strong>
                        点击一颗水果后轻触相邻格子，防止手滑。
                      </li>
                      <li>
                        <strong className="text-slate-200">防误触与锁定：</strong>
                        全局锁定页面橡皮筋回弹滚动，纯净全屏沉浸。
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-200">
                  <h4 className="font-semibold text-amber-300 text-sm mb-1.5">核心消除逻辑</h4>
                  <p className="leading-relaxed">
                    在棋盘横向或纵向连成 <strong className="text-white">至少 3 个相同水果</strong> 即可触发消除，碎裂成果汁微粒。消除后上方水果受真实重力自然下落填充，自动检测并触发多重连锁（Combo），每次连锁消除的音效音调将逐级攀升，产生极度舒适的解压爽感。
                  </p>
                </div>
              </div>
            )}

            {/* 2. 特殊水果与连携技 */}
            {activeSection === 'specials' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>特殊水果合成图鉴</span>
                  </h3>
                  <p className="text-slate-400">
                    当连线超过 3 个水果或构成特殊图形时，会合成强力特殊水果道具：
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 flex gap-3 items-start">
                    <span className="text-2xl p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 shrink-0">
                      ⚡
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        条纹水果（直线四消）
                      </h4>
                      <p className="text-slate-400 mt-1">
                        横向或纵向连消 4 个水果生成。带蓝色环形流光，消除时释放贯穿光柱，瞬间清空一整行或一整列的水果与障碍。
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 flex gap-3 items-start">
                    <span className="text-2xl p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0">
                      💣
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        果汁炸弹果（L/T 型五消）
                      </h4>
                      <p className="text-slate-400 mt-1">
                        拐角型或 T 字型消除 5 个水果生成。顶部带有引信光晕，消除时以自己为中心引发 3×3 范围的剧烈果汁爆破。
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 flex gap-3 items-start">
                    <span className="text-2xl p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
                      ✨
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        十字爆炸果（十字形五消）
                      </h4>
                      <p className="text-slate-400 mt-1">
                        四向交叉消除生成。带有四向棱晶尖刺，消除时同时射出行与列两条能量光波，十字扫清障碍。
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 flex gap-3 items-start">
                    <span className="text-2xl p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 shrink-0">
                      🌈
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        七彩极光果（直线五消）
                      </h4>
                      <p className="text-slate-400 mt-1">
                        横向或纵向一条直线消除 5 个水果诞生。晶莹剔透并带有彩虹星环，与任意相邻普通水果交换，即可吸纳清除全场同种水果！
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>双特殊水果对撞组合技（连携反应）</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-white">🌈 彩虹果 + 🌈 彩虹果</span>
                      <span className="text-slate-400">
                        终极神技！漫天彩虹光芒爆发，直接清空全场所有水果！
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-white">🌈 彩虹果 + ⚡ 条纹 / 💣 炸弹</span>
                      <span className="text-slate-400">
                        将全场所有同色普通水果全部转化为条纹或炸弹果并自动集体引爆！
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-white">⚡ 条纹果 + 💣 炸弹果</span>
                      <span className="text-slate-400">
                        合并化为超粗强力光束，同时横扫纵扫 3 行与 3 列巨型十字区域！
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-white">💣 炸弹果 + 💣 炸弹果</span>
                      <span className="text-slate-400">
                        超巨型核桃级大爆炸，粉碎 5×5 范围内的所有方块与障碍物！
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 开挂作弊神器详解 */}
            {activeSection === 'cheats' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span>解压开挂作弊神器使用说明</span>
                  </h3>
                  <p className="text-slate-400">
                    点击游戏画面左上角的「⚡ 开挂神器」按钮，即可展开强大的 8 大解压辅助神通：
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Hammer className="w-4 h-4" />
                      <span>1. 魔法粉碎锤</span>
                    </div>
                    <p className="text-slate-400">
                      开启后鼠标点击盘面上的任意一个水果、冰块或蜜罐，直接将其瞬间敲碎粉碎，不消耗步数，扫清死角障碍。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                      <Wand2 className="w-4 h-4" />
                      <span>2. 自由对换棒</span>
                    </div>
                    <p className="text-slate-400">
                      开启后打破“必须形成 3 连消”的规则限制！你可以随意调换任意两颗水果，即使无法消除也不会弹回，随心所欲搭建 5 连消彩虹果阵型！
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>3. 召唤彩虹果</span>
                    </div>
                    <p className="text-slate-400">
                      一键在盘面上直接凭空变出一颗「七彩极光果」，随时享受全屏同色大消除的极致快感。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                      <Bomb className="w-4 h-4" />
                      <span>4. 全屏炸弹雨</span>
                    </div>
                    <p className="text-slate-400">
                      随机将盘面上的 5 颗普通水果瞬间进化升级为炸弹果与条纹果，下一秒即可引爆全场连锁。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                      <Flame className="w-4 h-4" />
                      <span>5. 一键大清屏</span>
                    </div>
                    <p className="text-slate-400">
                      引爆宇宙级果汁冲击波，瞬间席卷消除整张棋盘上所有的水果与障碍，并从上方倾泻填满一整批全新水果！
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <PlusCircle className="w-4 h-4" />
                      <span>6. 补充 20 步</span>
                    </div>
                    <p className="text-slate-400">
                      当剩余步数紧张时，一键直接增加 20 步剩余步数，从容达成三星关卡目标。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <InfinityIcon className="w-4 h-4" />
                      <span>7. 无限步数模式</span>
                    </div>
                    <p className="text-slate-400">
                      开启后剩余步数变为「∞ 无限」，消除不再消耗步数，专为纯粹沉浸解压、想玩多久就玩多久的玩家打造。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Crown className="w-4 h-4" />
                      <span>8. 一秒三星通关</span>
                    </div>
                    <p className="text-slate-400">
                      直接达成当前关卡的所有目标并以 3 星高分结算，助你快速解锁后续主线与全部隐藏 3D 秘境！
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. 障碍与机关特性 */}
            {activeSection === 'obstacles' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>立体障碍物与地形机关</span>
                  </h3>
                  <p className="text-slate-400">
                    棋盘中包含多种富有层次的 3D 障碍方块，需利用消除涟漪逐一击破：
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <span className="text-xl">🧊</span>
                      <span>冰块方块（单层 / 双层）</span>
                    </div>
                    <p className="text-slate-400">
                      半透明冰晶立方体包裹水果。在其相邻格子消除任意水果，或使用条纹/炸弹攻击，即可击碎冰层。单层冰破裂化为冰晶飞溅；双层冰需要击打两次完全消解。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <span className="text-xl">🍯</span>
                      <span>琥珀蜜罐障碍方块</span>
                    </div>
                    <p className="text-slate-400">
                      实心固定障碍物，不能被移动或下落。具有 2 点耐久度，在旁边进行消除可使其罐身出现裂痕并溅出蜂蜜微粒，完全破碎后变成普通格子并允许水果填入。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <span className="text-xl">🌀</span>
                      <span>传送折跃光环（入口与出口）</span>
                    </div>
                    <p className="text-slate-400">
                      成对分布的空间传送门。紫色环为入口，青色环为出口。当入口下方的格子被消除空出时，上方水果掉入入口会立刻从出口涌出，改变重力下落轨迹。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <span className="text-xl">🕳️</span>
                      <span>浮空缺口与断崖</span>
                    </div>
                    <p className="text-slate-400">
                      棋盘局部的镂空无格子区域。消除后水果只会朝有效格子滑落，可利用此地形保护关键水果或针对性规划下落路线。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. 3D 隐藏秘境攻略 */}
            {activeSection === 'secrets' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>差异化 3D 隐藏秘境解锁指南</span>
                  </h3>
                  <p className="text-slate-400">
                    游戏内所有隐藏秘境均为完全独立的 3D 场景与玩法机制，达成特定成就条件即可永久收录进关卡图鉴：
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center justify-between text-sm font-bold text-sky-300 mb-1">
                      <span>🌊 星光浅滩（春日隐藏）</span>
                      <span className="text-xs font-normal text-slate-400">8×8 自由无障碍</span>
                    </div>
                    <p className="text-slate-300">
                      <strong className="text-amber-300">解锁条件：</strong>在第一关「春日果园」剩余 8 步以上通关。
                    </p>
                    <p className="text-slate-400 mt-1">
                      <strong>特色与奖励：</strong>浅蓝海边沙滩棋盘与舒缓微波；纯解压刷分乐园；永久解锁柔和星光消除粒子特效。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center justify-between text-sm font-bold text-cyan-300 mb-1">
                      <span>❄️ 冰湖秘境（夏日隐藏）</span>
                      <span className="text-xs font-normal text-slate-400">8×8 双层厚冰</span>
                    </div>
                    <p className="text-slate-300">
                      <strong className="text-amber-300">解锁条件：</strong>在第二关「夏日冰果场」一局内连续触发 4 次连锁消除。
                    </p>
                    <p className="text-slate-400 mt-1">
                      <strong>特色与奖励：</strong>冰封湖面立体棋盘，冷色调极简；专为厚冰多段连破设计；永久解锁「慢速深度解压」动画模式。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center justify-between text-sm font-bold text-amber-300 mb-1">
                      <span>🐝 蜂巢花园（蜜林隐藏）</span>
                      <span className="text-xs font-normal text-slate-400">7×7 蜂巢棋盘</span>
                    </div>
                    <p className="text-slate-300">
                      <strong className="text-amber-300">解锁条件：</strong>在第三关「蜜罐丛林」单局对局内击碎 6 个以上蜜罐。
                    </p>
                    <p className="text-slate-400 mt-1">
                      <strong>特色与奖励：</strong>暖黄蜂巢与漫天花粉；开局自带随机特殊水果道具，甜蜜爆棚。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center justify-between text-sm font-bold text-indigo-300 mb-1">
                      <span>☁️ 流云高空（溪谷隐藏）</span>
                      <span className="text-xs font-normal text-slate-400">8×8 浮空云海</span>
                    </div>
                    <p className="text-slate-300">
                      <strong className="text-amber-300">解锁条件：</strong>在第四关「传送溪谷」成功利用传送格子完成目标。
                    </p>
                    <p className="text-slate-400 mt-1">
                      <strong>特色与奖励：</strong>浮空云朵方块与 4 对传送门折跃系统；水果下落自带星芒柔光拖尾。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center justify-between text-sm font-bold text-purple-300 mb-1">
                      <span>🌈 彩虹秘境终极关（终极隐藏）</span>
                      <span className="text-xs font-normal text-slate-400">8×8 极光晶体</span>
                    </div>
                    <p className="text-slate-300">
                      <strong className="text-amber-300">解锁条件：</strong>主线 5 大关卡全部达成 3 星评分。
                    </p>
                    <p className="text-slate-400 mt-1">
                      <strong>特色与奖励：</strong>彩虹流光环绕的巨型华丽棋盘，开局自带多种高级特殊水果；通关永久解锁「全套水果微光皮肤」与珊瑚水晶棋盘底座。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/20 border border-white/5">
                  <h4 className="font-semibold text-white mb-1">3 个迷你休闲彩蛋棋盘</h4>
                  <ul className="space-y-1 text-slate-400">
                    <li>🌙 <strong>迷你夜间果园 (5×5)：</strong>任意对局中合成彩虹水果即可发现。</li>
                    <li>🌸 <strong>樱花小棋盘 (6×6)：</strong>在春日或彩虹关合成炸弹果解锁。</li>
                    <li>🪸 <strong>海底珊瑚棋盘 (6×6)：</strong>在冰果场中消除 20 个西瓜解锁。</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 5. 贴纸手账与底座 */}
            {activeSection === 'collection' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>收集系统与棋盘底座</span>
                  </h3>
                  <p className="text-slate-400">
                    对局中获得的果汁与贴纸将自动持久化保存在本地存档中：
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>星级评定与果汁获取</span>
                  </h4>
                  <p className="text-slate-400">
                    每关依据剩余步数判定星级（剩余 6 步以上评为 3 星；剩余 2 步以上评为 2 星）。每通关一局可收获果汁星星奖励，分数越高掉落越丰厚。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                    <span>📖 水果贴纸手账</span>
                  </h4>
                  <p className="text-slate-400">
                    通关与触发多次大连锁时，会随机掉落可爱立体水果贴纸（包含 8 大水果与条纹、炸弹、彩虹果），可在顶部「贴纸册」中翻阅图鉴与奇趣物语。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                    <span>🎨 棋盘底座风格即时切换</span>
                  </h4>
                  <p className="text-slate-400">
                    可在底部工具栏自由切换棋盘底座质感：<strong className="text-amber-200">原木温润</strong>、<strong className="text-cyan-200">冰晶剔透</strong>、<strong className="text-pink-200">樱花和风</strong>、<strong className="text-slate-200">星空深邃</strong>、<strong className="text-teal-200">珊瑚碧海</strong>，适配当日心情。
                  </p>
                </div>
              </div>
            )}

            {/* 6. 舒缓解压指南 */}
            {activeSection === 'zen' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-emerald-400" />
                    <span>禅意低压力设计理念</span>
                  </h3>
                  <p className="text-slate-400">
                    专为放松、解压与缓解疲劳而设计的休闲空间：
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                    <h4 className="font-semibold text-emerald-300 mb-1">无倒计时压迫</h4>
                    <p className="text-slate-400">
                      告别紧张急促的滴答声与强制限时。你可以随时停下手头操作，静听温和海浪或微风 BGM，沉思片刻再做决定。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                    <h4 className="font-semibold text-emerald-300 mb-1">可调节动画节奏（0.7x 慢速模式）</h4>
                    <p className="text-slate-400">
                      如果想细细品味水果碎裂成汁、重力下落挤压缓冲的物理过程，可以在底部工具坞切换至「0.7x 慢速解压」，让每次消除都如视觉按摩般舒适。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                    <h4 className="font-semibold text-emerald-300 mb-1">智能无死局洗牌与找提示</h4>
                    <p className="text-slate-400">
                      如果盘面无可消移动，系统会自动轻柔重洗水果，不会产生死局卡顿。一时没有思路时，点击底部的「找提示」按钮，可移动的水果会轻微跳跃示意。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs">
          <div className="text-slate-400 hidden sm:block">
            💡 随时在顶部点击「说明书」或设置面板重温游玩技巧
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {onOpenLevelSelect && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLevelSelect();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium cursor-pointer transition-colors"
              >
                查看关卡图鉴
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              开始畅玩
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
