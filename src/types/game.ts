export type FruitType =
  | 'strawberry'
  | 'orange'
  | 'grapes'
  | 'watermelon'
  | 'banana'
  | 'peach'
  | 'apple'
  | 'mango';

export type SpecialType =
  | 'none'
  | 'striped_h'
  | 'striped_v'
  | 'bomb'
  | 'cross'
  | 'rainbow';

export type TileType =
  | 'normal'
  | 'ice1'
  | 'ice2'
  | 'honey'
  | 'portal_in'
  | 'portal_out'
  | 'empty';

export type BoardSkin = 'wood' | 'ice' | 'sakura' | 'starlight' | 'coral';

export type ThemeType =
  | 'spring'
  | 'ice'
  | 'honey'
  | 'portal'
  | 'rainbow'
  | 'starlight'
  | 'cloud'
  | 'sakura'
  | 'night'
  | 'coral';

export interface CellData {
  id: string;
  r: number;
  c: number;
  fruit: FruitType | null;
  special: SpecialType;
  tile: TileType;
  honeyHp?: number;
  portalTarget?: { r: number; c: number };
}

export interface LevelTarget {
  type: 'fruit' | 'ice' | 'honey' | 'score';
  fruitType?: FruitType;
  targetCount: number;
  currentCount: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  subtitle: string;
  category: 'main' | 'hidden' | 'easter_egg';
  rows: number;
  cols: number;
  moves: number;
  theme: ThemeType;
  targets: LevelTarget[];
  unlockCondition?: string;
  rewardDescription: string;
  boardSkin?: BoardSkin;
  initialBoard?: (TileType | { tile: TileType; fruit?: FruitType; special?: SpecialType; honeyHp?: number; portalTarget?: { r: number; c: number } } | null)[][];
}

export interface MatchGroup {
  cells: { r: number; c: number }[];
  fruit: FruitType;
  specialProduced?: {
    r: number;
    c: number;
    type: SpecialType;
  };
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: number; // 0.7 = zen slow, 1.0 = normal, 1.4 = fast
  quality: 'high' | 'medium' | 'low';
  boardSkin: BoardSkin;
}

export interface LevelRecord {
  stars: number;
  highScore: number;
  completed: boolean;
}

export interface UserSaveData {
  records: Record<string, LevelRecord>;
  unlockedLevels: string[];
  stickers: Record<string, number>;
  totalJuice: number;
  settings: GameSettings;
  unlockedSkins: BoardSkin[];
  activeSkin: BoardSkin;
  unlockedBonuses: {
    starlightParticles: boolean;
    slowZenMode: boolean;
    bonusSpecialStart: boolean;
    fruitGlow: boolean;
    rainbowSkins: boolean;
  };
}
