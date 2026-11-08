import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameScene } from './three/GameScene';
import {
  ALL_LEVELS,
} from './game/levels';
import {
  CellData,
  FruitType,
  SpecialType,
  LevelConfig,
  UserSaveData,
  BoardSkin,
} from './types/game';
import {
  createInitialGrid,
  findMatches,
  getSpecialExplosionCells,
  getSpecialComboExplosion,
  damageNeighborObstacles,
  applyGravityAndRefill,
  hasPossibleMove,
  shuffleBoard,
  FRUIT_TYPES,
} from './game/matchLogic';
import {
  loadSaveData,
  saveSaveData,
  FRUIT_STICKER_INFO,
} from './game/storage';
import { sound } from './audio/soundEngine';

// Components
import { HeaderBar } from './components/HeaderBar';
import { MiniHUD } from './components/MiniHUD';
import { BottomZenDock } from './components/BottomZenDock';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { StickerBookModal } from './components/StickerBookModal';
import { SettingsModal } from './components/SettingsModal';
import { SecretUnlockToast } from './components/SecretUnlockToast';
import { ManualModal } from './components/ManualModal';
import { CheatsDock } from './components/CheatsDock';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GameScene | null>(null);

  // Persistence State
  const [saveData, setSaveData] = useState<UserSaveData>(loadSaveData);

  // Active Level State
  const [currentLevelId, setCurrentLevelId] = useState<string>('main_1');
  const currentLevel = ALL_LEVELS.find((l) => l.id === currentLevelId) || ALL_LEVELS[0];

  // In-Game Grid & Stats
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [movesLeft, setMovesLeft] = useState<number>(currentLevel.moves);
  const [targets, setTargets] = useState(currentLevel.targets.map((t) => ({ ...t, currentCount: 0 })));
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Super Cheats & Boosters State (30 God Privileges)
  const [isHammerActive, setIsHammerActive] = useState<boolean>(false);
  const [isFreeSwapActive, setIsFreeSwapActive] = useState<boolean>(false);
  const [isTeleportSwapActive, setIsTeleportSwapActive] = useState<boolean>(false);
  const [isTapToPopActive, setIsTapToPopActive] = useState<boolean>(false);
  const [isInfiniteMoves, setIsInfiniteMoves] = useState<boolean>(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState<boolean>(false);
  const [isTurboAutoPlay, setIsTurboAutoPlay] = useState<boolean>(false);
  const [isGodMode, setIsGodMode] = useState<boolean>(false);

  // Session Tracking for Hidden Level Unlocks
  const sessionStatsRef = useRef({
    honeySmashed: 0,
    maxCombo: 0,
    usedPortal: false,
    rainbowCreated: false,
    bombCreated: false,
    watermelonMatchedInIce: false,
  });

  // UI Modals
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isStickerBookOpen, setIsStickerBookOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [secretToastName, setSecretToastName] = useState<string | null>(null);
  const [victoryModal, setVictoryModal] = useState<{
    isOpen: boolean;
    isWin: boolean;
    stars: number;
    score: number;
    movesLeft: number;
    juiceEarned: number;
    droppedSticker?: { name: string; icon: string };
    unlockedSecretLevelName?: string;
  } | null>(null);

  // Save changes to localStorage whenever saveData updates
  const updateSave = useCallback((updater: (prev: UserSaveData) => UserSaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      saveSaveData(next);
      return next;
    });
  }, []);

  // Unlock secret level helper
  const unlockSecretLevel = useCallback((secretId: string) => {
    const targetLvl = ALL_LEVELS.find((l) => l.id === secretId);
    if (!targetLvl) return;

    setSaveData((prev) => {
      if (prev.unlockedLevels.includes(secretId)) return prev;
      sound.playUnlockSecret();
      setSecretToastName(targetLvl.name);
      const next = {
        ...prev,
        unlockedLevels: [...prev.unlockedLevels, secretId],
      };
      saveSaveData(next);
      return next;
    });
  }, []);

  // Initialize or Reset Level
  const initLevel = useCallback((level: LevelConfig, skinOverride?: BoardSkin) => {
    const skin = skinOverride || saveData.activeSkin || level.boardSkin || 'wood';
    const newGrid = createInitialGrid(level.rows, level.cols, level.initialBoard);

    setGrid(newGrid);
    setMovesLeft(level.moves);
    setTargets(level.targets.map((t) => ({ ...t, currentCount: 0 })));
    setScore(0);
    setCombo(0);
    setIsLocked(false);
    setVictoryModal(null);

    // Reset session trackers
    sessionStatsRef.current = {
      honeySmashed: 0,
      maxCombo: 0,
      usedPortal: false,
      rainbowCreated: false,
      bombCreated: false,
      watermelonMatchedInIce: false,
    };

    // Sync 3D Scene
    if (sceneRef.current) {
      sceneRef.current.syncGrid(newGrid, level.theme, skin);
    }

    // Play themed BGM
    sound.startBGM(level.theme);
  }, [saveData.activeSkin]);

  // Mount 3D Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new GameScene(mountRef.current, {
      onSwapAttempt: (r1, c1, r2, c2) => {
        handlePlayerSwap(r1, c1, r2, c2);
      },
      onSelectCell: () => {
        sound.playSwap();
      },
      onCellClick: (r, c) => {
        return handleDirectCellClick(r, c);
      },
    });

    sceneRef.current = scene;
    scene.setAnimationSpeed(saveData.settings.animationSpeed);
    scene.setQuality(saveData.settings.quality);
    scene.isTeleportSwapAllowed = isTeleportSwapActive;

    // Initialize initial level
    initLevel(currentLevel);

    return () => {
      scene.dispose();
      sceneRef.current = null;
      sound.stopBGM();
    };
  }, []);

  // Sync teleport swap state to scene
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.isTeleportSwapAllowed = isTeleportSwapActive;
    }
  }, [isTeleportSwapActive]);

  // Level switch effect
  const handleSelectLevel = (levelId: string) => {
    setCurrentLevelId(levelId);
    const targetLvl = ALL_LEVELS.find((l) => l.id === levelId) || ALL_LEVELS[0];
    initLevel(targetLvl);
  };

  // Keyboard shortcut: P to pause / open settings
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setIsSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Check Win/Loss conditions
  const checkGameEnd = useCallback((currentTargets: typeof targets, remainingMoves: number, currentScore: number) => {
    const isWin = currentTargets.every((t) => t.currentCount >= t.targetCount);

    if (isWin) {
      sound.playVictory();
      // Calculate Stars: 3 stars if >= 6 moves left; 2 stars if >= 2 moves left; else 1 star
      let stars = 1;
      if (remainingMoves >= 6) stars = 3;
      else if (remainingMoves >= 2) stars = 2;

      const juiceEarned = 20 + remainingMoves * 5 + stars * 10;

      // Pick a random fruit sticker drop
      const fruitKeys = FRUIT_TYPES;
      const pickedFruit = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];
      const stickerInfo = FRUIT_STICKER_INFO[pickedFruit];

      // Check if unlocked secret realms:
      let unlockedSecret: string | undefined = undefined;

      // Secret 1: 春日果园剩余 8 步以上通关 -> 星光浅滩
      if (currentLevel.id === 'main_1' && remainingMoves >= 8) {
        unlockSecretLevel('hidden_starlight');
        unlockedSecret = '星光浅滩';
      }

      // Check mainline progress to unlock next main level
      const mainLevels = ALL_LEVELS.filter((l) => l.category === 'main');
      const currentIndex = mainLevels.findIndex((l) => l.id === currentLevel.id);
      let nextMainId: string | undefined = undefined;
      if (currentIndex !== -1 && currentIndex + 1 < mainLevels.length) {
        nextMainId = mainLevels[currentIndex + 1].id;
      }

      updateSave((prev) => {
        const prevRec = prev.records[currentLevel.id] || { stars: 0, highScore: 0, completed: false };
        const newRecords = {
          ...prev.records,
          [currentLevel.id]: {
            stars: Math.max(prevRec.stars, stars),
            highScore: Math.max(prevRec.highScore, currentScore),
            completed: true,
          },
        };

        const newUnlockedLevels = [...prev.unlockedLevels];
        if (nextMainId && !newUnlockedLevels.includes(nextMainId)) {
          newUnlockedLevels.push(nextMainId);
        }

        // Check if all 5 main levels are 3-starred -> unlock Rainbow Wonderland!
        const allMainThreeStars = mainLevels.every((l) => (newRecords[l.id]?.stars || 0) >= 3);
        if (allMainThreeStars && !newUnlockedLevels.includes('hidden_rainbow')) {
          newUnlockedLevels.push('hidden_rainbow');
          unlockedSecret = '彩虹秘境终极关';
        }

        const newStickers = {
          ...prev.stickers,
          [pickedFruit]: (prev.stickers[pickedFruit] || 0) + 1,
        };

        return {
          ...prev,
          records: newRecords,
          unlockedLevels: newUnlockedLevels,
          stickers: newStickers,
          totalJuice: prev.totalJuice + juiceEarned,
        };
      });

      setVictoryModal({
        isOpen: true,
        isWin: true,
        stars,
        score: currentScore,
        movesLeft: remainingMoves,
        juiceEarned,
        droppedSticker: stickerInfo ? { name: stickerInfo.name, icon: stickerInfo.icon } : undefined,
        unlockedSecretLevelName: unlockedSecret,
      });
    } else if (remainingMoves <= 0) {
      setVictoryModal({
        isOpen: true,
        isWin: false,
        stars: 0,
        score: currentScore,
        movesLeft: 0,
        juiceEarned: 0,
      });
    }
  }, [currentLevel, unlockSecretLevel, updateSave]);

  // Super Cheats Implementations
  const executeHammerSmash = async (r: number, c: number) => {
    const cell = grid[r]?.[c];
    if (!cell || cell.tile === 'empty') return;

    setIsLocked(true);
    try {
      const clearedFruit: { r: number; c: number; fruit: FruitType }[] = [];
      if (cell.fruit) {
        clearedFruit.push({ r, c, fruit: cell.fruit });
        sound.playBomb();
      }

      if (cell.tile === 'ice1' || cell.tile === 'ice2') {
        sound.playIceBreak();
        cell.tile = 'normal';
        sceneRef.current?.triggerIceBreak(r, c, 0);
        setTargets((prev) =>
          prev.map((t) => (t.type === 'ice' ? { ...t, currentCount: t.currentCount + 1 } : t))
        );
      } else if (cell.tile === 'honey') {
        sound.playHoneyBreak();
        cell.tile = 'normal';
        cell.honeyHp = undefined;
        sceneRef.current?.triggerHoneyBreak(r, c, true);
        setTargets((prev) =>
          prev.map((t) => (t.type === 'honey' ? { ...t, currentCount: t.currentCount + 1 } : t))
        );
      }

      if (clearedFruit.length > 0) {
        const fType = cell.fruit!;
        setTargets((prev) =>
          prev.map((t) =>
            t.type === 'fruit' && t.fruitType === fType
              ? { ...t, currentCount: t.currentCount + 1 }
              : t
          )
        );
        await new Promise<void>((resolve) => {
          sceneRef.current?.animateClear(clearedFruit, undefined, resolve);
        });
        cell.fruit = null;
        cell.special = 'none';
      }

      // Gravity & Refill
      const drops = applyGravityAndRefill(grid);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateDrops(drops, resolve);
      });
    } finally {
      setIsLocked(false);
      sceneRef.current?.syncPositionsFromGrid(grid);
    }
  };

  const handleDirectCellClick = (r: number, c: number): boolean => {
    if (isHammerActive) {
      setIsHammerActive(false);
      executeHammerSmash(r, c);
      return true;
    }
    if (isTapToPopActive) {
      handleTapToPop(r, c);
      return true;
    }
    return false;
  };

  const handleTapToPop = async (r: number, c: number) => {
    if (isLocked) return;
    const targetCell = grid[r]?.[c];
    if (!targetCell || !targetCell.fruit || targetCell.tile === 'empty') return;

    setIsLocked(true);
    try {
      sound.playBomb();
      const fruitType = targetCell.fruit;
      const clearedFruit: { r: number; c: number; fruit: FruitType }[] = [];

      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const cell = grid[row][col];
          if (cell.fruit === fruitType && cell.tile !== 'empty') {
            clearedFruit.push({ r: row, c: col, fruit: cell.fruit });
            cell.fruit = null;
            cell.special = 'none';
          }
          if (Math.abs(row - r) <= 1 && Math.abs(col - c) <= 1) {
            if (cell.tile === 'ice1' || cell.tile === 'ice2') {
              cell.tile = 'normal';
              sceneRef.current?.triggerIceBreak(row, col, 0);
            } else if (cell.tile === 'honey') {
              cell.tile = 'normal';
              cell.honeyHp = undefined;
              sceneRef.current?.triggerHoneyBreak(row, col, true);
            }
          }
        }
      }

      setTargets((prev) =>
        prev.map((t) =>
          t.type === 'fruit' && t.fruitType === fruitType
            ? { ...t, currentCount: t.currentCount + clearedFruit.length }
            : t
        )
      );
      setScore((prev) => prev + clearedFruit.length * 150);

      await new Promise<void>((resolve) => {
        sceneRef.current?.animateClear(clearedFruit, undefined, resolve);
      });

      const drops = applyGravityAndRefill(grid);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateDrops(drops, resolve);
      });
    } finally {
      setIsLocked(false);
      sceneRef.current?.syncPositionsFromGrid(grid);
    }
  };

  const handleSpawnRainbow = () => {
    if (isLocked) return;
    const candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].fruit && grid[r][c].tile !== 'empty' && grid[r][c].tile !== 'honey') {
          candidates.push({ r, c });
        }
      }
    }
    if (candidates.length === 0) return;
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, 8).forEach((pt) => {
      grid[pt.r][pt.c].special = 'rainbow';
    });
    sound.playSpecialCreate();
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
    unlockSecretLevel('egg_night');
  };

  const handleSpawnBombRain = () => {
    if (isLocked) return;
    const candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].fruit && grid[r][c].tile !== 'empty' && grid[r][c].tile !== 'honey') {
          candidates.push({ r, c });
        }
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, 8).forEach((pt) => {
      grid[pt.r][pt.c].special = 'bomb';
    });
    sound.playSpecialCreate();
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
    unlockSecretLevel('egg_sakura');
  };

  const handleSpawnCrossLaser = () => {
    if (isLocked) return;
    const candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].fruit && grid[r][c].tile !== 'empty' && grid[r][c].tile !== 'honey') {
          candidates.push({ r, c });
        }
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, 8).forEach((pt) => {
      grid[pt.r][pt.c].special = 'cross';
    });
    sound.playSpecialCreate();
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
  };

  const handleStripedMatrix = () => {
    if (isLocked) return;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].fruit && grid[r][c].tile !== 'empty' && grid[r][c].tile !== 'honey') {
          grid[r][c].special = (r + c) % 2 === 0 ? 'striped_h' : 'striped_v';
        }
      }
    }
    sound.playSpecialCreate();
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
  };

  const handleRainbowDuo = () => {
    if (isLocked) return;
    const midR = Math.floor(grid.length / 2);
    const midC = Math.floor(grid[0].length / 2);
    if (grid[midR]?.[midC]) grid[midR][midC].special = 'rainbow';
    if (grid[midR]?.[midC + 1]) grid[midR][midC + 1].special = 'rainbow';
    sound.playRainbow();
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
  };

  const handleTargetFruitTransmute = () => {
    if (isLocked) return;
    const needed = targets.find((t) => t.type === 'fruit' && t.currentCount < t.targetCount)?.fruitType || 'strawberry';
    let changed = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].fruit && grid[r][c].tile !== 'empty' && changed < 10) {
          grid[r][c].fruit = needed;
          changed++;
        }
      }
    }
    sound.playSpecialCreate();
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
  };

  const handleRowLaser = async () => {
    if (isLocked) return;
    setIsLocked(true);
    try {
      sound.playMatch(4);
      const clearedFruit: { r: number; c: number; fruit: FruitType }[] = [];
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const cell = grid[r][c];
          if (cell.fruit && cell.tile !== 'empty') {
            clearedFruit.push({ r, c, fruit: cell.fruit });
            cell.fruit = null;
            cell.special = 'none';
          }
        }
      }
      setScore((prev) => prev + 2200);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateClear(clearedFruit, undefined, resolve);
      });
      const drops = applyGravityAndRefill(grid);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateDrops(drops, resolve);
      });
    } finally {
      setIsLocked(false);
      sceneRef.current?.syncPositionsFromGrid(grid);
    }
  };

  const handleColLaser = async () => {
    if (isLocked) return;
    await handleRowLaser();
  };

  const handleShockwave = async () => {
    if (isLocked) return;
    setIsLocked(true);
    try {
      sound.playBomb();
      const cleared: { r: number; c: number; fruit: FruitType }[] = [];
      const rows = grid.length;
      const cols = grid[0].length;
      const keyPoints = [
        { r: 0, c: 0 },
        { r: 0, c: cols - 1 },
        { r: rows - 1, c: 0 },
        { r: rows - 1, c: cols - 1 },
        { r: Math.floor(rows / 2), c: Math.floor(cols / 2) },
      ];
      for (const pt of keyPoints) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const gr = pt.r + dr;
            const gc = pt.c + dc;
            if (gr >= 0 && gr < rows && gc >= 0 && gc < cols) {
              const cell = grid[gr][gc];
              if (cell.fruit && cell.tile !== 'empty') {
                cleared.push({ r: gr, c: gc, fruit: cell.fruit });
                cell.fruit = null;
                cell.special = 'none';
              }
              if (cell.tile === 'ice1' || cell.tile === 'ice2') {
                cell.tile = 'normal';
                sceneRef.current?.triggerIceBreak(gr, gc, 0);
              } else if (cell.tile === 'honey') {
                cell.tile = 'normal';
                cell.honeyHp = undefined;
                sceneRef.current?.triggerHoneyBreak(gr, gc, true);
              }
            }
          }
        }
      }
      setScore((prev) => prev + 1800);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateClear(cleared, undefined, resolve);
      });
      const drops = applyGravityAndRefill(grid);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateDrops(drops, resolve);
      });
    } finally {
      setIsLocked(false);
      sceneRef.current?.syncPositionsFromGrid(grid);
    }
  };

  const handleInstantMeltIce = () => {
    sound.playIceBreak();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell.tile === 'ice1' || cell.tile === 'ice2') {
          cell.tile = 'normal';
          sceneRef.current?.triggerIceBreak(r, c, 0);
        }
      }
    }
    setTargets((prev) =>
      prev.map((t) => (t.type === 'ice' ? { ...t, currentCount: t.targetCount } : t))
    );
    sound.playSpecialCreate();
  };

  const handleInstantPurgeHoney = () => {
    sound.playHoneyBreak();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell.tile === 'honey') {
          cell.tile = 'normal';
          cell.honeyHp = undefined;
          sceneRef.current?.triggerHoneyBreak(r, c, true);
        }
      }
    }
    setTargets((prev) =>
      prev.map((t) => (t.type === 'honey' ? { ...t, currentCount: t.targetCount } : t))
    );
    sound.playSpecialCreate();
  };

  const handleLuckyShuffle = () => {
    sound.playSpecialCreate();
    shuffleBoard(grid);
    const candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c].fruit && grid[r][c].tile !== 'empty' && grid[r][c].tile !== 'honey') {
          candidates.push({ r, c });
        }
      }
    }
    if (candidates.length >= 2) {
      grid[candidates[0].r][candidates[0].c].special = 'rainbow';
      grid[candidates[1].r][candidates[1].c].special = 'bomb';
    }
    sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
  };

  const handleMaxStickers = () => {
    sound.playVictory();
    updateSave((prev) => {
      const allStickers: Record<string, number> = {};
      FRUIT_TYPES.forEach((f) => {
        allStickers[f] = 99;
      });
      return {
        ...prev,
        stickers: allStickers,
      };
    });
  };

  const handleMaxJuice = () => {
    sound.playRainbow();
    updateSave((prev) => ({
      ...prev,
      totalJuice: prev.totalJuice + 88888,
    }));
  };

  const handleUnlockAllLevels = () => {
    sound.playVictory();
    updateSave((prev) => ({
      ...prev,
      unlockedLevels: ALL_LEVELS.map((l) => l.id),
    }));
  };

  const handleUnlockAllSkins = () => {
    sound.playSpecialCreate();
    updateSave((prev) => ({
      ...prev,
      activeSkin: 'starlight',
    }));
    sceneRef.current?.syncGrid(grid, currentLevel.theme, 'starlight');
  };

  const handleOneClickAllGod = () => {
    sound.playVictory();
    setIsAutoPlayActive(true);
    setIsTurboAutoPlay(true);
    setIsTapToPopActive(true);
    setIsFreeSwapActive(true);
    setIsTeleportSwapActive(true);
    setIsInfiniteMoves(true);
    setIsGodMode(true);
    handleMaxJuice();
    handleMaxStickers();
    handleUnlockAllLevels();
    handleSpawnRainbow();
  };

  const handleFullBoardNova = async () => {
    if (isLocked) return;
    setIsLocked(true);
    try {
      sound.playRainbow();
      const cleared: { r: number; c: number; fruit: FruitType }[] = [];
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const cell = grid[r][c];
          if (cell.fruit) {
            cleared.push({ r, c, fruit: cell.fruit });
            cell.fruit = null;
            cell.special = 'none';
          }
          if (cell.tile === 'ice1' || cell.tile === 'ice2') {
            cell.tile = 'normal';
            sceneRef.current?.triggerIceBreak(r, c, 0);
          }
          if (cell.tile === 'honey') {
            cell.tile = 'normal';
            cell.honeyHp = undefined;
            sceneRef.current?.triggerHoneyBreak(r, c, true);
          }
        }
      }

      setTargets((prev) =>
        prev.map((t) => ({ ...t, currentCount: t.targetCount }))
      );
      setScore((prev) => prev + 2500);

      await new Promise<void>((resolve) => {
        sceneRef.current?.animateClear(cleared, undefined, resolve);
      });

      const drops = applyGravityAndRefill(grid);
      await new Promise<void>((resolve) => {
        sceneRef.current?.animateDrops(drops, resolve);
      });
    } finally {
      setIsLocked(false);
      sceneRef.current?.syncPositionsFromGrid(grid);
    }
  };

  const handleAddMoves = (count: number) => {
    sound.playSpecialCreate();
    setMovesLeft((prev) => prev + count);
  };

  const handleInstantWin = () => {
    sound.playVictory();
    const fulfilledTargets = targets.map((t) => ({ ...t, currentCount: t.targetCount }));
    setTargets(fulfilledTargets);
    checkGameEnd(fulfilledTargets, Math.max(movesLeft, 12), score + 6666);
  };

  // Main turn-based swap execution
  const handlePlayerSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isLocked) return;

    // Hammer mode intercept
    if (isHammerActive) {
      setIsHammerActive(false);
      await executeHammerSmash(r1, c1);
      return;
    }

    if (movesLeft <= 0 && !isInfiniteMoves) return;

    const f1 = grid[r1]?.[c1];
    const f2 = grid[r2]?.[c2];
    if (!f1 || !f2 || !f1.fruit || !f2.fruit) return;

    const isSpecialCombo = f1.special !== 'none' && f2.special !== 'none';
    const isRainbowSwap = f1.special === 'rainbow' || f2.special === 'rainbow';

    // Verify move validity
    const tempFruit = f1.fruit;
    const tempSpecial = f1.special;
    f1.fruit = f2.fruit;
    f1.special = f2.special;
    f2.fruit = tempFruit;
    f2.special = tempSpecial;

    const matches = findMatches(grid, { r1, c1, r2, c2 });

    // Restore
    f2.fruit = f1.fruit;
    f2.special = f1.special;
    f1.fruit = tempFruit;
    f1.special = tempSpecial;

    // If free swap cheat is OFF and no match, gently bounce back without corruption
    if (!isSpecialCombo && !isRainbowSwap && matches.length === 0 && !isFreeSwapActive && !isGodMode) {
      sound.playInvalid();
      sceneRef.current?.animateInvalidSwap(r1, c1, r2, c2);
      return;
    }

    // VALID SWAP! Lock user interaction during animation cascade
    setIsLocked(true);
    sound.playSwap();

    let newMoves = movesLeft;
    if (!isInfiniteMoves && !isGodMode) {
      newMoves = movesLeft - 1;
      setMovesLeft(newMoves);
    }

    try {
      // Apply actual swap to grid: SWAP FRUIT, SPECIAL AND ID!
      const tempId = f1.id;
      f1.fruit = f2.fruit;
      f1.special = f2.special;
      f1.id = f2.id;

      f2.fruit = tempFruit;
      f2.special = tempSpecial;
      f2.id = tempId;

      await new Promise<void>((resolve) => {
        sceneRef.current?.animateSwap(r1, c1, r2, c2, resolve);
      });

      // Check if swap involved portals
      if (f1.tile === 'portal_in' || f2.tile === 'portal_in') {
        sessionStatsRef.current.usedPortal = true;
        if (currentLevel.id === 'main_4') {
          unlockSecretLevel('hidden_cloud');
        }
      }

      let runningScore = score;
      let localCombo = 0;
      let currentTargets = [...targets];

      // Execution routine: handle matches, explosions, obstacle breaks, and gravity drops
      let keepCascading = true;

      while (keepCascading) {
        localCombo++;
        setCombo(localCombo);
        sessionStatsRef.current.maxCombo = Math.max(sessionStatsRef.current.maxCombo, localCombo);

        if (currentLevel.id === 'main_2' && sessionStatsRef.current.maxCombo >= 4) {
          unlockSecretLevel('hidden_ice_lake');
        }

        const cellsToClear: { r: number; c: number }[] = [];
        let specialCreated: { r: number; c: number; type: SpecialType } | undefined = undefined;

        if (localCombo === 1 && (isSpecialCombo || isRainbowSwap)) {
          if (isSpecialCombo) {
            const comboCells = getSpecialComboExplosion(grid, r1, c1, r2, c2, tempSpecial, f2.special);
            cellsToClear.push(...comboCells);
            sound.playBomb();
          } else if (isRainbowSwap) {
            const rainbowPos = tempSpecial === 'rainbow' ? { r: r2, c: c2 } : { r: r1, c: c1 };
            const partnerFruit = tempSpecial === 'rainbow' ? f1.fruit : f2.fruit;
            const rainbowCells = getSpecialExplosionCells(grid, rainbowPos.r, rainbowPos.c, 'rainbow', partnerFruit);
            cellsToClear.push(...rainbowCells);
            sound.playRainbow();
          }
        } else {
          const found = findMatches(grid, localCombo === 1 ? { r1, c1, r2, c2 } : undefined);

          if (found.length === 0) {
            if (localCombo === 1 && (isGodMode || isFreeSwapActive)) {
              // Forced Elimination Cheat: blast the swapped fruits and 3x3 surrounding cells!
              sound.playBomb();
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const gr = r2 + dr;
                  const gc = c2 + dc;
                  if (gr >= 0 && gr < grid.length && gc >= 0 && gc < grid[0].length) {
                    const cCell = grid[gr][gc];
                    if (cCell.fruit && cCell.tile !== 'empty') {
                      cellsToClear.push({ r: gr, c: gc });
                    }
                  }
                }
              }
              specialCreated = { r: r2, c: c2, type: isGodMode ? 'rainbow' : 'bomb' };
            } else {
              keepCascading = false;
              break;
            }
          } else {
            sound.playMatch(localCombo);

            for (const group of found) {
              cellsToClear.push(...group.cells);

              const matchedFruit = group.fruit;
              currentTargets = currentTargets.map((tgt) => {
                if (tgt.type === 'fruit' && tgt.fruitType === matchedFruit) {
                  return { ...tgt, currentCount: tgt.currentCount + group.cells.length };
                }
                return tgt;
              });

              if (matchedFruit === 'watermelon' && currentLevel.theme === 'ice') {
                unlockSecretLevel('egg_coral');
              }

              if (group.specialProduced) {
                specialCreated = group.specialProduced;
                sound.playSpecialCreate();

                if (group.specialProduced.type === 'rainbow') {
                  unlockSecretLevel('egg_night');
                } else if (group.specialProduced.type === 'bomb') {
                  unlockSecretLevel('egg_sakura');
                }
              } else if (isGodMode && !specialCreated && group.cells[0]) {
                specialCreated = {
                  r: group.cells[0].r,
                  c: group.cells[0].c,
                  type: Math.random() > 0.5 ? 'rainbow' : 'bomb',
                };
              }
            }
          }
        }

        if (cellsToClear.length === 0) {
          keepCascading = false;
          break;
        }

        // De-duplicate cleared cells
        const uniqueMap = new Map<string, { r: number; c: number }>();
        for (const pt of cellsToClear) {
          uniqueMap.set(`${pt.r}_${pt.c}`, pt);
        }
        const uniqueCleared = Array.from(uniqueMap.values());

        const clearedFruits: { r: number; c: number; fruit: FruitType }[] = [];
        for (const pt of uniqueCleared) {
          const cell = grid[pt.r][pt.c];
          if (cell.fruit) {
            clearedFruits.push({ r: pt.r, c: pt.c, fruit: cell.fruit });
          }
        }

        const { damagedIce, damagedHoney } = damageNeighborObstacles(grid, uniqueCleared);

        if (damagedIce.length > 0) {
          sound.playIceBreak();
          for (const pt of damagedIce) {
            const cell = grid[pt.r][pt.c];
            const level = cell.tile === 'ice1' ? 1 : 0;
            sceneRef.current?.triggerIceBreak(pt.r, pt.c, level);
            currentTargets = currentTargets.map((tgt) => {
              if (tgt.type === 'ice') {
                return { ...tgt, currentCount: tgt.currentCount + 1 };
              }
              return tgt;
            });
          }
        }

        if (damagedHoney.length > 0) {
          sound.playHoneyBreak();
          for (const pt of damagedHoney) {
            const cell = grid[pt.r][pt.c];
            const destroyed = cell.tile !== 'honey';
            sceneRef.current?.triggerHoneyBreak(pt.r, pt.c, destroyed);
            if (destroyed) {
              sessionStatsRef.current.honeySmashed++;
              if (currentLevel.id === 'main_3' && sessionStatsRef.current.honeySmashed >= 6) {
                unlockSecretLevel('hidden_honeycomb');
              }

              currentTargets = currentTargets.map((tgt) => {
                if (tgt.type === 'honey') {
                  return { ...tgt, currentCount: tgt.currentCount + 1 };
                }
                return tgt;
              });
            }
          }
        }

        const points = uniqueCleared.length * 50 * localCombo;
        runningScore += points;
        setScore(runningScore);

        currentTargets = currentTargets.map((tgt) => {
          if (tgt.type === 'score') {
            return { ...tgt, currentCount: runningScore };
          }
          return tgt;
        });
        setTargets(currentTargets);

        await new Promise<void>((resolve) => {
          sceneRef.current?.animateClear(clearedFruits, specialCreated, resolve);
        });

        for (const pt of uniqueCleared) {
          grid[pt.r][pt.c].fruit = null;
          grid[pt.r][pt.c].special = 'none';
        }

        if (specialCreated) {
          grid[specialCreated.r][specialCreated.c].fruit = 'strawberry';
          grid[specialCreated.r][specialCreated.c].special = specialCreated.type;
        }

        const drops = applyGravityAndRefill(grid);
        await new Promise<void>((resolve) => {
          sceneRef.current?.animateDrops(drops, resolve);
        });

        await new Promise((r) => setTimeout(r, 60 / saveData.settings.animationSpeed));
      }

      if (!hasPossibleMove(grid)) {
        shuffleBoard(grid);
        sceneRef.current?.syncGrid(grid, currentLevel.theme, saveData.activeSkin);
      }

      checkGameEnd(currentTargets, newMoves, runningScore);
    } finally {
      setIsLocked(false);
      sceneRef.current?.syncPositionsFromGrid(grid);
    }
  };

  // Hint button handler
  const handleGetHint = () => {
    if (isLocked) return;
    const move = hasPossibleMove(grid);
    if (move && sceneRef.current) {
      sound.playSpecialCreate();
      sceneRef.current.setHint({ r: move.r1, c: move.c1 });
      setTimeout(() => {
        sceneRef.current?.setHint(null);
      }, 3500);
    }
  };

  // Auto-Play Bot Loop (看电影自动消除挂机托管)
  useEffect(() => {
    if (!isAutoPlayActive && !isTurboAutoPlay) return;

    const intervalTime = isTurboAutoPlay ? 220 : 620;

    const timer = setInterval(() => {
      // 1. If victory modal is open: auto advance to next level after brief celebration
      if (victoryModal?.isOpen) {
        if (victoryModal.isWin) {
          const mainLevels = ALL_LEVELS.filter((l) => l.category === 'main');
          const idx = mainLevels.findIndex((l) => l.id === currentLevel.id);
          if (idx !== -1 && idx + 1 < mainLevels.length) {
            handleSelectLevel(mainLevels[idx + 1].id);
          } else {
            initLevel(currentLevel);
          }
        } else {
          // If lost, restart level immediately
          initLevel(currentLevel);
        }
        return;
      }

      // 2. If locked (animating), wait for animations to complete
      if (isLocked) return;

      // 3. Look for the best move
      let bestMove: { r1: number; c1: number; r2: number; c2: number } | null = null;

      // Priority 1: Special Fruit Swaps
      for (let r = 0; r < grid.length && !bestMove; r++) {
        for (let c = 0; c < grid[r].length && !bestMove; c++) {
          const cell = grid[r][c];
          if (!cell.fruit || cell.special === 'none') continue;

          const neighbors = [
            { r: r, c: c + 1 },
            { r: r + 1, c: c },
          ];
          for (const n of neighbors) {
            if (n.r < grid.length && n.c < grid[0].length) {
              const nCell = grid[n.r][n.c];
              if (nCell.fruit) {
                if (cell.special === 'rainbow' || nCell.special === 'rainbow' || nCell.special !== 'none') {
                  bestMove = { r1: r, c1: c, r2: n.r, c2: n.c };
                  break;
                }
              }
            }
          }
        }
      }

      // Priority 2: Standard Match-3 moves
      if (!bestMove) {
        const rows = grid.length;
        const cols = grid[0]?.length || 0;

        for (let r = 0; r < rows && !bestMove; r++) {
          for (let c = 0; c < cols && !bestMove; c++) {
            const cell = grid[r][c];
            if (!cell.fruit || cell.tile === 'empty' || cell.tile === 'honey') continue;

            const neighbors = [
              { r: r, c: c + 1 },
              { r: r + 1, c: c },
            ];

            for (const n of neighbors) {
              if (n.r < rows && n.c < cols) {
                const nCell = grid[n.r][n.c];
                if (!nCell.fruit || nCell.tile === 'empty' || nCell.tile === 'honey') continue;

                // Test swap
                const testFruit: FruitType = cell.fruit;
                const testSpec: SpecialType = cell.special;
                cell.fruit = nCell.fruit;
                cell.special = nCell.special;
                nCell.fruit = testFruit;
                nCell.special = testSpec;

                const matches = findMatches(grid);

                // Restore
                nCell.fruit = cell.fruit;
                nCell.special = cell.special;
                cell.fruit = testFruit;
                cell.special = testSpec;

                if (matches.length > 0) {
                  bestMove = { r1: r, c1: c, r2: n.r, c2: n.c };
                  break;
                }
              }
            }
          }
        }
      }

      // Execute best move or trigger a big nova clear
      if (bestMove) {
        handlePlayerSwap(bestMove.r1, bestMove.c1, bestMove.r2, bestMove.c2);
      } else {
        handleFullBoardNova();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlayActive, isTurboAutoPlay, isLocked, grid, victoryModal, currentLevel]);

  return (
    <main className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Viewport - Maximized to 100% full screen */}
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 z-0 touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Top Narrow Navigation Header */}
      <HeaderBar
        currentLevel={currentLevel}
        soundEnabled={saveData.settings.soundEnabled}
        onToggleSound={() => {
          const next = !saveData.settings.soundEnabled;
          sound.setSoundEnabled(next);
          sound.setMusicEnabled(next);
          updateSave((prev) => ({
            ...prev,
            settings: { ...prev.settings, soundEnabled: next, musicEnabled: next },
          }));
        }}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenLevels={() => setIsLevelSelectOpen(true)}
        onOpenStickers={() => setIsStickerBookOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRestart={() => initLevel(currentLevel)}
      />

      {/* Super Cheats & Boosters Dock (Top-Left) */}
      <CheatsDock
        isInfiniteMoves={isInfiniteMoves}
        onToggleInfiniteMoves={() => setIsInfiniteMoves(!isInfiniteMoves)}
        onAddMoves={handleAddMoves}
        onInstantWin={handleInstantWin}
        onFullBoardNova={handleFullBoardNova}
        onRowLaser={handleRowLaser}
        onColLaser={handleColLaser}
        onShockwave={handleShockwave}
        onSpawnRainbow={handleSpawnRainbow}
        onSpawnBombRain={handleSpawnBombRain}
        onSpawnCrossLaser={handleSpawnCrossLaser}
        onStripedMatrix={handleStripedMatrix}
        onRainbowDuo={handleRainbowDuo}
        onTargetFruitTransmute={handleTargetFruitTransmute}
        onInstantMeltIce={handleInstantMeltIce}
        onInstantPurgeHoney={handleInstantPurgeHoney}
        isHammerActive={isHammerActive}
        onToggleHammer={() => {
          setIsHammerActive(!isHammerActive);
          if (isFreeSwapActive) setIsFreeSwapActive(false);
        }}
        isFreeSwapActive={isFreeSwapActive}
        onToggleFreeSwap={() => {
          setIsFreeSwapActive(!isFreeSwapActive);
          if (isHammerActive) setIsHammerActive(false);
        }}
        isTeleportSwapActive={isTeleportSwapActive}
        onToggleTeleportSwap={() => setIsTeleportSwapActive(!isTeleportSwapActive)}
        isTapToPopActive={isTapToPopActive}
        onToggleTapToPop={() => setIsTapToPopActive(!isTapToPopActive)}
        isAutoPlayActive={isAutoPlayActive}
        onToggleAutoPlay={() => setIsAutoPlayActive(!isAutoPlayActive)}
        isTurboAutoPlay={isTurboAutoPlay}
        onToggleTurboAutoPlay={() => setIsTurboAutoPlay(!isTurboAutoPlay)}
        isGodMode={isGodMode}
        onToggleGodMode={() => {
          const next = !isGodMode;
          setIsGodMode(next);
          if (next) {
            setIsInfiniteMoves(true);
            setIsFreeSwapActive(true);
            setIsTapToPopActive(true);
          }
        }}
        onLuckyShuffle={handleLuckyShuffle}
        onMaxStickers={handleMaxStickers}
        onMaxJuice={handleMaxJuice}
        onUnlockAllLevels={handleUnlockAllLevels}
        onUnlockAllSkins={handleUnlockAllSkins}
        onOneClickAllGod={handleOneClickAllGod}
      />

      {/* Mini Top-Right Floating HUD (Unobtrusive) */}
      <MiniHUD
        targets={targets}
        movesLeft={movesLeft}
        score={score}
        combo={combo}
        isInfiniteMoves={isInfiniteMoves}
      />

      {/* Collapsible Bottom Zen Dock */}
      <BottomZenDock
        speed={saveData.settings.animationSpeed}
        onSetSpeed={(spd) => {
          sceneRef.current?.setAnimationSpeed(spd);
          updateSave((prev) => ({
            ...prev,
            settings: { ...prev.settings, animationSpeed: spd },
          }));
        }}
        boardSkin={saveData.activeSkin}
        onSetBoardSkin={(sk) => {
          updateSave((prev) => ({
            ...prev,
            activeSkin: sk,
          }));
          sceneRef.current?.syncGrid(grid, currentLevel.theme, sk);
        }}
        quality={saveData.settings.quality}
        onSetQuality={(q) => {
          sceneRef.current?.setQuality(q);
          updateSave((prev) => ({
            ...prev,
            settings: { ...prev.settings, quality: q },
          }));
        }}
        onGetHint={handleGetHint}
        canHint={!isLocked && movesLeft > 0}
        onOpenManual={() => setIsManualOpen(true)}
      />

      {/* Secret Level Discovery Toast */}
      {secretToastName && (
        <SecretUnlockToast
          levelName={secretToastName}
          onClose={() => setSecretToastName(null)}
        />
      )}

      {/* Level Select Modal */}
      {isLevelSelectOpen && (
        <LevelSelectModal
          levels={ALL_LEVELS}
          currentLevelId={currentLevelId}
          unlockedLevelIds={saveData.unlockedLevels}
          records={saveData.records}
          onSelectLevel={handleSelectLevel}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}

      {/* Fruit Stickers Modal */}
      {isStickerBookOpen && (
        <StickerBookModal
          stickers={saveData.stickers}
          totalJuice={saveData.totalJuice}
          onClose={() => setIsStickerBookOpen(false)}
        />
      )}

      {/* Game Manual Modal */}
      {isManualOpen && (
        <ManualModal
          onClose={() => setIsManualOpen(false)}
          onOpenLevelSelect={() => {
            setIsManualOpen(false);
            setIsLevelSelectOpen(true);
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={(newSet) => {
            if (newSet.soundVolume !== undefined) sound.setSoundVolume(newSet.soundVolume);
            if (newSet.musicVolume !== undefined) sound.setMusicVolume(newSet.musicVolume);
            if (newSet.soundEnabled !== undefined) sound.setSoundEnabled(newSet.soundEnabled);
            if (newSet.musicEnabled !== undefined) sound.setMusicEnabled(newSet.musicEnabled);

            updateSave((prev) => ({
              ...prev,
              settings: { ...prev.settings, ...newSet },
            }));
          }}
          onResetProgress={() => {
            localStorage.clear();
            window.location.reload();
          }}
          onOpenManual={() => setIsManualOpen(true)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Victory / Game Over Modal */}
      {victoryModal && victoryModal.isOpen && (
        <VictoryModal
          isWin={victoryModal.isWin}
          level={currentLevel}
          stars={victoryModal.stars}
          score={victoryModal.score}
          movesLeft={victoryModal.movesLeft}
          juiceEarned={victoryModal.juiceEarned}
          droppedSticker={victoryModal.droppedSticker}
          unlockedSecretLevelName={victoryModal.unlockedSecretLevelName}
          onNextLevel={
            (() => {
              const mainLevels = ALL_LEVELS.filter((l) => l.category === 'main');
              const idx = mainLevels.findIndex((l) => l.id === currentLevel.id);
              if (idx !== -1 && idx + 1 < mainLevels.length) {
                return () => handleSelectLevel(mainLevels[idx + 1].id);
              }
              return undefined;
            })()
          }
          onRestart={() => initLevel(currentLevel)}
          onOpenLevelSelect={() => {
            setVictoryModal(null);
            setIsLevelSelectOpen(true);
          }}
        />
      )}
    </main>
  );
}
