import { UserSaveData, BoardSkin } from '../types/game';

const STORAGE_KEY = 'zen_fruit_match_3d_save_v1';

export const FRUIT_STICKER_INFO: Record<string, { name: string; desc: string; icon: string }> = {
  strawberry: { name: '甜心草莓', desc: '红润多汁，散发浓郁莓香', icon: '🍓' },
  orange: { name: '多汁鲜橙', desc: '满载阳光与维C的金色果实', icon: '🍊' },
  grapes: { name: '水晶葡萄', desc: '如紫水晶般剔透圆润的浆果', icon: '🍇' },
  watermelon: { name: '冰镇西瓜', desc: '夏日绿皮红瓤的解暑胜品', icon: '🍉' },
  banana: { name: '软糯香蕉', desc: '自带月牙弧度的金黄能量果', icon: '🍌' },
  peach: { name: '粉嫩蜜桃', desc: '双颊晕染娇羞粉色的甜美鲜果', icon: '🍑' },
  apple: { name: '清脆青苹', desc: '爽脆多汁、酸甜恰到好处', icon: '🍏' },
  mango: { name: '热带芒果', desc: '如凝固夕阳般的浓醇金黄', icon: '🥭' },
  striped: { name: '横扫条纹果', desc: '释放贯穿全列的微风光浪', icon: '⚡' },
  bomb: { name: '果汁炸弹', desc: '咕嘟咕嘟，绽放一圈果肉烟花', icon: '💣' },
  rainbow: { name: '七彩极光果', desc: '吸收了天空虹彩的神奇果实', icon: '🌈' },
};

const DEFAULT_SAVE: UserSaveData = {
  records: {},
  unlockedLevels: ['main_1'],
  stickers: {
    strawberry: 1,
    orange: 1,
    grapes: 1,
    watermelon: 1,
    banana: 1,
    peach: 1,
    apple: 1,
    mango: 1,
  },
  totalJuice: 50,
  settings: {
    soundVolume: 0.7,
    musicVolume: 0.5,
    soundEnabled: true,
    musicEnabled: true,
    animationSpeed: 1.0,
    quality: 'high',
    boardSkin: 'wood',
  },
  unlockedSkins: ['wood'],
  activeSkin: 'wood',
  unlockedBonuses: {
    starlightParticles: false,
    slowZenMode: false,
    bonusSpecialStart: false,
    fruitGlow: false,
    rainbowSkins: false,
  },
};

export function loadSaveData(): UserSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
      unlockedBonuses: { ...DEFAULT_SAVE.unlockedBonuses, ...(parsed.unlockedBonuses || {}) },
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function saveSaveData(data: UserSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}
