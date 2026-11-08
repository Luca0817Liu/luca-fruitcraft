import { CellData, FruitType, SpecialType, TileType, MatchGroup } from '../types/game';

export const FRUIT_TYPES: FruitType[] = [
  'strawberry',
  'orange',
  'grapes',
  'watermelon',
  'banana',
  'peach',
  'apple',
  'mango',
];

export function getRandomFruit(exclude?: FruitType[]): FruitType {
  const choices = exclude ? FRUIT_TYPES.filter((f) => !exclude.includes(f)) : FRUIT_TYPES;
  return choices[Math.floor(Math.random() * choices.length)];
}

let nextIdCounter = 1;
export function makeCellId(): string {
  return `cell_${nextIdCounter++}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Creates an initial board preventing automatic 3-in-a-row matches
 */
export function createInitialGrid(
  rows: number,
  cols: number,
  layoutTemplate?: (TileType | { tile: TileType; fruit?: FruitType; special?: SpecialType; honeyHp?: number; portalTarget?: { r: number; c: number } } | null)[][]
): CellData[][] {
  const grid: CellData[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < cols; c++) {
      let tile: TileType = 'normal';
      let honeyHp: number | undefined = undefined;
      let portalTarget: { r: number; c: number } | undefined = undefined;
      let preFruit: FruitType | undefined = undefined;
      let preSpecial: SpecialType = 'none';

      if (layoutTemplate && layoutTemplate[r] && layoutTemplate[r][c] !== undefined) {
        const item = layoutTemplate[r][c];
        if (item === null) {
          tile = 'empty';
        } else if (typeof item === 'string') {
          tile = item;
          if (tile === 'honey') honeyHp = 2;
        } else if (typeof item === 'object') {
          tile = item.tile;
          honeyHp = item.honeyHp ?? (tile === 'honey' ? 2 : undefined);
          portalTarget = item.portalTarget;
          preFruit = item.fruit;
          preSpecial = item.special || 'none';
        }
      }

      if (tile === 'empty' || tile === 'honey') {
        row.push({
          id: makeCellId(),
          r,
          c,
          fruit: null,
          special: 'none',
          tile,
          honeyHp,
          portalTarget,
        });
        continue;
      }

      // Avoid creating 3-in-a-row initially
      const forbidden: FruitType[] = [];
      if (c >= 2 && row[c - 1]?.fruit && row[c - 2]?.fruit && row[c - 1].fruit === row[c - 2].fruit) {
        forbidden.push(row[c - 1].fruit as FruitType);
      }
      if (r >= 2 && grid[r - 1]?.[c]?.fruit && grid[r - 2]?.[c]?.fruit && grid[r - 1][c].fruit === grid[r - 2][c].fruit) {
        forbidden.push(grid[r - 1][c].fruit as FruitType);
      }

      const fruit = preFruit || getRandomFruit(forbidden);

      row.push({
        id: makeCellId(),
        r,
        c,
        fruit,
        special: preSpecial,
        tile,
        honeyHp,
        portalTarget,
      });
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Scan grid for matches and detect special formations
 */
export function findMatches(
  grid: CellData[][],
  lastSwap?: { r1: number; c1: number; r2: number; c2: number }
): MatchGroup[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const hRuns: { r: number; c: number }[][] = [];
  const vRuns: { r: number; c: number }[][] = [];

  // 1. Horizontal runs
  for (let r = 0; r < rows; r++) {
    let matchLen = 1;
    for (let c = 0; c < cols; c++) {
      const current = grid[r][c];
      const next = c + 1 < cols ? grid[r][c + 1] : null;

      if (
        current.fruit &&
        next &&
        next.fruit &&
        current.fruit === next.fruit &&
        current.tile !== 'empty' &&
        next.tile !== 'empty'
      ) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const run: { r: number; c: number }[] = [];
          for (let k = c - matchLen + 1; k <= c; k++) {
            run.push({ r, c: k });
          }
          hRuns.push(run);
        }
        matchLen = 1;
      }
    }
  }

  // 2. Vertical runs
  for (let c = 0; c < cols; c++) {
    let matchLen = 1;
    for (let r = 0; r < rows; r++) {
      const current = grid[r][c];
      const next = r + 1 < rows ? grid[r + 1][c] : null;

      if (
        current.fruit &&
        next &&
        next.fruit &&
        current.fruit === next.fruit &&
        current.tile !== 'empty' &&
        next.tile !== 'empty'
      ) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const run: { r: number; c: number }[] = [];
          for (let k = r - matchLen + 1; k <= r; k++) {
            run.push({ r: k, c });
          }
          vRuns.push(run);
        }
        matchLen = 1;
      }
    }
  }

  if (hRuns.length === 0 && vRuns.length === 0) {
    return [];
  }

  // Combine overlapping horizontal and vertical runs
  const groups: MatchGroup[] = [];
  const allRuns = [...hRuns.map((r) => ({ run: r, dir: 'h' as const })), ...vRuns.map((r) => ({ run: r, dir: 'v' as const }))];
  const usedRuns = new Set<number>();

  for (let i = 0; i < allRuns.length; i++) {
    if (usedRuns.has(i)) continue;
    usedRuns.add(i);

    const cluster = [...allRuns[i].run];
    let hasH = allRuns[i].dir === 'h';
    let hasV = allRuns[i].dir === 'v';
    let maxLen = allRuns[i].run.length;

    // Expand connected runs of same fruit
    let added = true;
    while (added) {
      added = false;
      for (let j = 0; j < allRuns.length; j++) {
        if (usedRuns.has(j)) continue;
        const other = allRuns[j];
        const sameFruit = grid[cluster[0].r][cluster[0].c].fruit === grid[other.run[0].r][other.run[0].c].fruit;
        if (!sameFruit) continue;

        // Check if overlaps
        const intersects = other.run.some((pt) => cluster.some((c) => c.r === pt.r && c.c === pt.c));
        if (intersects) {
          usedRuns.add(j);
          if (other.dir === 'h') hasH = true;
          if (other.dir === 'v') hasV = true;
          maxLen = Math.max(maxLen, other.run.length);
          for (const pt of other.run) {
            if (!cluster.some((c) => c.r === pt.r && c.c === pt.c)) {
              cluster.push(pt);
            }
          }
          added = true;
        }
      }
    }

    const fruit = grid[cluster[0].r][cluster[0].c].fruit!;
    let specialProduced: { r: number; c: number; type: SpecialType } | undefined = undefined;

    // Pick pivot position for special fruit (prefer swapped position if inside cluster)
    let pivot = cluster[0];
    if (lastSwap) {
      const inSwap1 = cluster.find((pt) => pt.r === lastSwap.r1 && pt.c === lastSwap.c1);
      const inSwap2 = cluster.find((pt) => pt.r === lastSwap.r2 && pt.c === lastSwap.c2);
      if (inSwap1) pivot = inSwap1;
      else if (inSwap2) pivot = inSwap2;
      else pivot = cluster[Math.floor(cluster.length / 2)];
    } else {
      pivot = cluster[Math.floor(cluster.length / 2)];
    }

    // Determine special fruit type:
    // 5 in line -> Rainbow
    // Cross (+: both h and v >= 3) -> Cross bomb
    // T or L shape -> Bomb
    // 4 in line -> Striped (h or v)
    if (maxLen >= 5 && !hasH && hasV) {
      specialProduced = { r: pivot.r, c: pivot.c, type: 'rainbow' };
    } else if (maxLen >= 5 && hasH && !hasV) {
      specialProduced = { r: pivot.r, c: pivot.c, type: 'rainbow' };
    } else if (hasH && hasV) {
      // Intersection shape
      if (cluster.length >= 6) {
        specialProduced = { r: pivot.r, c: pivot.c, type: 'cross' };
      } else {
        specialProduced = { r: pivot.r, c: pivot.c, type: 'bomb' };
      }
    } else if (maxLen === 4) {
      const isH = hasH;
      specialProduced = {
        r: pivot.r,
        c: pivot.c,
        type: isH ? 'striped_v' : 'striped_h',
      };
    }

    groups.push({
      cells: cluster,
      fruit,
      specialProduced,
    });
  }

  return groups;
}

/**
 * Handle special fruit activations: computes all cells that should explode
 */
export function getSpecialExplosionCells(
  grid: CellData[][],
  triggerR: number,
  triggerC: number,
  specialType: SpecialType,
  partnerFruit?: FruitType | null
): { r: number; c: number }[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const result: { r: number; c: number }[] = [];
  const visited = new Set<string>();

  function add(r: number, c: number) {
    if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c].tile !== 'empty') {
      const key = `${r}_${c}`;
      if (!visited.has(key)) {
        visited.add(key);
        result.push({ r, c });
      }
    }
  }

  if (specialType === 'striped_h') {
    for (let c = 0; c < cols; c++) add(triggerR, c);
  } else if (specialType === 'striped_v') {
    for (let r = 0; r < rows; r++) add(r, triggerC);
  } else if (specialType === 'bomb') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        add(triggerR + dr, triggerC + dc);
      }
    }
  } else if (specialType === 'cross') {
    for (let c = 0; c < cols; c++) add(triggerR, c);
    for (let r = 0; r < rows; r++) add(r, triggerC);
  } else if (specialType === 'rainbow') {
    // Clear all instances of partner fruit across entire board
    const targetFruit = partnerFruit || getRandomFruit();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].fruit === targetFruit) {
          add(r, c);
        }
      }
    }
    add(triggerR, triggerC);
  }

  return result;
}

/**
 * Handle combo of two special fruits swapped together
 */
export function getSpecialComboExplosion(
  grid: CellData[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  s1: SpecialType,
  s2: SpecialType
): { r: number; c: number }[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const result: { r: number; c: number }[] = [];
  const visited = new Set<string>();

  function add(r: number, c: number) {
    if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c].tile !== 'empty') {
      const key = `${r}_${c}`;
      if (!visited.has(key)) {
        visited.add(key);
        result.push({ r, c });
      }
    }
  }

  // Rainbow + Rainbow: clears the entire board
  if (s1 === 'rainbow' && s2 === 'rainbow') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        add(r, c);
      }
    }
    return result;
  }

  // Rainbow + Striped/Bomb: convert all fruits of same type into special and detonate
  if (s1 === 'rainbow' || s2 === 'rainbow') {
    const specialPartner = s1 === 'rainbow' ? s2 : s1;
    const normalPartner = (s1 === 'rainbow' ? grid[r2][c2].fruit : grid[r1][c1].fruit) || getRandomFruit();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].fruit === normalPartner) {
          if (specialPartner === 'bomb') {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) add(r + dr, c + dc);
            }
          } else {
            for (let cc = 0; cc < cols; cc++) add(r, cc);
            for (let rr = 0; rr < rows; rr++) add(rr, c);
          }
        }
      }
    }
    add(r1, c1);
    add(r2, c2);
    return result;
  }

  // Bomb + Bomb: 5x5 massive explosion
  if (s1 === 'bomb' && s2 === 'bomb') {
    const midR = Math.round((r1 + r2) / 2);
    const midC = Math.round((c1 + c2) / 2);
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        add(midR + dr, midC + dc);
      }
    }
    return result;
  }

  // Striped + Bomb: 3 rows and 3 columns
  if (
    (s1 === 'bomb' && (s2 === 'striped_h' || s2 === 'striped_v')) ||
    (s2 === 'bomb' && (s1 === 'striped_h' || s1 === 'striped_v'))
  ) {
    const midR = Math.round((r1 + r2) / 2);
    const midC = Math.round((c1 + c2) / 2);
    for (let dr = -1; dr <= 1; dr++) {
      for (let c = 0; c < cols; c++) add(midR + dr, c);
    }
    for (let dc = -1; dc <= 1; dc++) {
      for (let r = 0; r < rows; r++) add(r, midC + dc);
    }
    return result;
  }

  // Striped + Striped: 1 full row and 1 full col
  if (
    (s1 === 'striped_h' || s1 === 'striped_v') &&
    (s2 === 'striped_h' || s2 === 'striped_v')
  ) {
    for (let c = 0; c < cols; c++) add(r2, c);
    for (let r = 0; r < rows; r++) add(r, c2);
    return result;
  }

  return result;
}

/**
 * Damage neighboring obstacles (ice & honey) around matched cells
 */
export function damageNeighborObstacles(
  grid: CellData[][],
  clearedCells: { r: number; c: number }[]
): { damagedIce: { r: number; c: number }[]; damagedHoney: { r: number; c: number }[] } {
  const rows = grid.length;
  const cols = grid[0].length;
  const damagedIce: { r: number; c: number }[] = [];
  const damagedHoney: { r: number; c: number }[] = [];
  const checked = new Set<string>();

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const { r, c } of clearedCells) {
    for (const { dr, dc } of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const key = `${nr}_${nc}`;
      if (checked.has(key)) continue;
      checked.add(key);

      const cell = grid[nr][nc];
      if (cell.tile === 'ice1') {
        cell.tile = 'normal';
        damagedIce.push({ r: nr, c: nc });
      } else if (cell.tile === 'ice2') {
        cell.tile = 'ice1';
        damagedIce.push({ r: nr, c: nc });
      } else if (cell.tile === 'honey' && cell.honeyHp) {
        cell.honeyHp--;
        damagedHoney.push({ r: nr, c: nc });
        if (cell.honeyHp <= 0) {
          cell.tile = 'normal';
          cell.honeyHp = undefined;
        }
      }
    }
  }

  return { damagedIce, damagedHoney };
}

/**
 * Gravity and tile refilling with portal support
 * Returns details about movement paths for animations
 */
export interface DropAnimation {
  id: string;
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  isNew: boolean;
  fruit: FruitType;
  special: SpecialType;
}

export function applyGravityAndRefill(grid: CellData[][]): DropAnimation[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const drops: DropAnimation[] = [];

  // Drop existing fruits downwards column by column
  for (let c = 0; c < cols; c++) {
    for (let r = rows - 1; r >= 0; r--) {
      // If this cell is valid and empty, find the fruit directly above
      if (grid[r][c].tile !== 'empty' && grid[r][c].tile !== 'honey' && grid[r][c].fruit === null) {
        // Look up for a fruit
        let sourceR = r - 1;
        let found = false;

        while (sourceR >= 0) {
          const sourceCell = grid[sourceR][c];
          if (sourceCell.tile === 'empty' || sourceCell.tile === 'honey') {
            // Cannot drop through empty gap or solid honey
            break;
          }
          if (sourceCell.fruit !== null) {
            // Transfer fruit down
            grid[r][c].fruit = sourceCell.fruit;
            grid[r][c].special = sourceCell.special;
            grid[r][c].id = sourceCell.id;

            drops.push({
              id: sourceCell.id,
              fromR: sourceR,
              fromC: c,
              toR: r,
              toC: c,
              isNew: false,
              fruit: sourceCell.fruit,
              special: sourceCell.special,
            });

            sourceCell.fruit = null;
            sourceCell.special = 'none';
            found = true;
            break;
          }
          sourceR--;
        }

        // If not found from above, check if this column receives from a portal_in
        if (!found) {
          // Check for portal connection to this column
          for (let pr = 0; pr < rows; pr++) {
            for (let pc = 0; pc < cols; pc++) {
              const pCell = grid[pr][pc];
              if (pCell.tile === 'portal_in' && pCell.portalTarget) {
                if (pCell.portalTarget.r === r && pCell.portalTarget.c === c && pCell.fruit) {
                  grid[r][c].fruit = pCell.fruit;
                  grid[r][c].special = pCell.special;
                  grid[r][c].id = pCell.id;

                  drops.push({
                    id: pCell.id,
                    fromR: pr,
                    fromC: pc,
                    toR: r,
                    toC: c,
                    isNew: false,
                    fruit: pCell.fruit,
                    special: pCell.special,
                  });

                  pCell.fruit = null;
                  pCell.special = 'none';
                  found = true;
                  break;
                }
              }
            }
            if (found) break;
          }
        }
      }
    }
  }

  // Refill top empty cells with fresh fruits
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cell = grid[r][c];
      if (cell.tile !== 'empty' && cell.tile !== 'honey' && cell.fruit === null) {
        const newFruit = getRandomFruit();
        const newId = makeCellId();
        cell.fruit = newFruit;
        cell.special = 'none';
        cell.id = newId;

        drops.push({
          id: newId,
          fromR: -1 - r,
          fromC: c,
          toR: r,
          toC: c,
          isNew: true,
          fruit: newFruit,
          special: 'none',
        });
      }
    }
  }

  return drops;
}

/**
 * Check if the board has at least one possible valid move
 */
export function hasPossibleMove(grid: CellData[][]): { r1: number; c1: number; r2: number; c2: number } | null {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const current = grid[r][c];
      if (!current.fruit || current.tile === 'empty' || current.tile === 'honey') continue;

      // Check right swap
      if (c + 1 < cols && grid[r][c + 1].fruit && grid[r][c + 1].tile !== 'empty' && grid[r][c + 1].tile !== 'honey') {
        if (testSwap(grid, r, c, r, c + 1)) {
          return { r1: r, c1: c, r2: r, c2: c + 1 };
        }
      }

      // Check down swap
      if (r + 1 < rows && grid[r + 1][c].fruit && grid[r + 1][c].tile !== 'empty' && grid[r + 1][c].tile !== 'honey') {
        if (testSwap(grid, r, c, r + 1, c)) {
          return { r1: r, c1: c, r2: r + 1, c2: c };
        }
      }
    }
  }

  return null;
}

function testSwap(grid: CellData[][], r1: number, c1: number, r2: number, c2: number): boolean {
  const f1 = grid[r1][c1];
  const f2 = grid[r2][c2];

  // If either is rainbow, it's always a valid move
  if (f1.special === 'rainbow' || f2.special === 'rainbow') return true;
  // If both are special, swapping them produces a combo explosion
  if (f1.special !== 'none' && f2.special !== 'none') return true;

  // Swap fruits temporarily
  const tempFruit = f1.fruit;
  const tempSpec = f1.special;
  f1.fruit = f2.fruit;
  f1.special = f2.special;
  f2.fruit = tempFruit;
  f2.special = tempSpec;

  const matches = findMatches(grid);

  // Restore
  f2.fruit = f1.fruit;
  f2.special = f1.special;
  f1.fruit = tempFruit;
  f1.special = tempSpec;

  return matches.length > 0;
}

/**
 * Shuffle all fruits on board without altering obstacle tiles
 */
export function shuffleBoard(grid: CellData[][]): void {
  const fruits: { fruit: FruitType; special: SpecialType; id: string }[] = [];
  const cells: CellData[] = [];

  for (const row of grid) {
    for (const cell of row) {
      if (cell.tile !== 'empty' && cell.tile !== 'honey' && cell.fruit) {
        fruits.push({ fruit: cell.fruit, special: cell.special, id: cell.id });
        cells.push(cell);
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = fruits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fruits[i], fruits[j]] = [fruits[j], fruits[i]];
  }

  cells.forEach((cell, idx) => {
    cell.fruit = fruits[idx].fruit;
    cell.special = fruits[idx].special;
    cell.id = fruits[idx].id;
  });
}
