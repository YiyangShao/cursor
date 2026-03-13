/**
 * 游戏配置：难度、地图、设置
 */

import type { EnemyTypeKey } from './enemy';
import type { TowerTypeKey } from './tower';

export type DifficultyKey = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  enemyHpMultiplier: number;
  enemyRewardMultiplier: number;
  initialGold: number;
  initialLives: number;
  waveCount: number;
}

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  easy: {
    enemyHpMultiplier: 0.7,
    enemyRewardMultiplier: 1.2,
    initialGold: 300,
    initialLives: 25,
    waveCount: 5,
  },
  normal: {
    enemyHpMultiplier: 1,
    enemyRewardMultiplier: 1,
    initialGold: 250,
    initialLives: 20,
    waveCount: 5,
  },
  hard: {
    enemyHpMultiplier: 1.4,
    enemyRewardMultiplier: 0.8,
    initialGold: 200,
    initialLives: 15,
    waveCount: 6,
  },
};

export type ChapterId = 1 | 2 | 3 | 4;

export interface ChapterStyle {
  background: [string, string, string, string];
  pathStroke: string;
  pathFill: string;
  pathCellFill: string;
  pathCellStroke: string;
  gridStroke: string;
  startFill: string;
  startStroke: string;
  startIcon: string;
  endFill: string;
  endStroke: string;
  endIcon: string;
  flower: { fill: string; stroke: string; icon: string };
  grass: { fill: string; stroke: string; icon: string };
  stone: { fill: string; stroke: string; icon: string };
}

export const CHAPTER_STYLES: Record<ChapterId, ChapterStyle> = {
  1: {
    background: ['#fff5f7', '#fce4ec', '#f3e5f5', '#e8eaf6'],
    pathStroke: 'rgba(255, 182, 193, 0.7)',
    pathFill: 'rgba(255, 218, 224, 0.5)',
    pathCellFill: 'rgba(255, 218, 224, 0.5)',
    pathCellStroke: 'rgba(255, 105, 180, 0.35)',
    gridStroke: 'rgba(255, 182, 193, 0.15)',
    startFill: 'rgba(173, 216, 230, 0.6)',
    startStroke: 'rgba(135, 206, 250, 0.8)',
    startIcon: '🚪',
    endFill: 'rgba(255, 182, 193, 0.6)',
    endStroke: 'rgba(255, 105, 180, 0.8)',
    endIcon: '🏠',
    flower: { fill: 'rgba(255, 182, 193, 0.6)', stroke: 'rgba(255, 105, 180, 0.5)', icon: '🌸' },
    grass: { fill: 'rgba(144, 238, 144, 0.4)', stroke: 'rgba(34, 139, 34, 0.3)', icon: '🌿' },
    stone: { fill: 'rgba(210, 180, 140, 0.5)', stroke: 'rgba(139, 90, 43, 0.4)', icon: '🪨' },
  },
  2: {
    background: ['#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784'],
    pathStroke: 'rgba(56, 142, 60, 0.6)',
    pathFill: 'rgba(129, 199, 132, 0.4)',
    pathCellFill: 'rgba(129, 199, 132, 0.4)',
    pathCellStroke: 'rgba(46, 125, 50, 0.4)',
    gridStroke: 'rgba(102, 187, 106, 0.2)',
    startFill: 'rgba(178, 223, 219, 0.7)',
    startStroke: 'rgba(0, 150, 136, 0.7)',
    startIcon: '🌲',
    endFill: 'rgba(139, 195, 74, 0.6)',
    endStroke: 'rgba(85, 139, 47, 0.8)',
    endIcon: '🏡',
    flower: { fill: 'rgba(129, 199, 132, 0.5)', stroke: 'rgba(46, 125, 50, 0.4)', icon: '🌻' },
    grass: { fill: 'rgba(165, 214, 167, 0.5)', stroke: 'rgba(27, 94, 32, 0.4)', icon: '🍀' },
    stone: { fill: 'rgba(121, 85, 72, 0.4)', stroke: 'rgba(62, 39, 35, 0.4)', icon: '🪵' },
  },
  3: {
    background: ['#fff8e1', '#ffecb3', '#ffe082', '#ffd54f'],
    pathStroke: 'rgba(245, 124, 0, 0.6)',
    pathFill: 'rgba(255, 183, 77, 0.4)',
    pathCellFill: 'rgba(255, 183, 77, 0.4)',
    pathCellStroke: 'rgba(230, 81, 0, 0.4)',
    gridStroke: 'rgba(255, 193, 7, 0.2)',
    startFill: 'rgba(255, 224, 178, 0.7)',
    startStroke: 'rgba(255, 152, 0, 0.7)',
    startIcon: '🏜️',
    endFill: 'rgba(255, 171, 64, 0.6)',
    endStroke: 'rgba(239, 108, 0, 0.8)',
    endIcon: '🏺',
    flower: { fill: 'rgba(255, 213, 79, 0.5)', stroke: 'rgba(255, 160, 0, 0.4)', icon: '🌵' },
    grass: { fill: 'rgba(205, 220, 57, 0.4)', stroke: 'rgba(130, 119, 23, 0.4)', icon: '🌾' },
    stone: { fill: 'rgba(188, 170, 164, 0.5)', stroke: 'rgba(121, 85, 72, 0.4)', icon: '🪨' },
  },
  4: {
    background: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6'],
    pathStroke: 'rgba(33, 150, 243, 0.6)',
    pathFill: 'rgba(100, 181, 246, 0.4)',
    pathCellFill: 'rgba(100, 181, 246, 0.4)',
    pathCellStroke: 'rgba(25, 118, 210, 0.4)',
    gridStroke: 'rgba(66, 165, 245, 0.2)',
    startFill: 'rgba(178, 235, 242, 0.7)',
    startStroke: 'rgba(0, 188, 212, 0.7)',
    startIcon: '⛵',
    endFill: 'rgba(79, 195, 247, 0.6)',
    endStroke: 'rgba(2, 119, 189, 0.8)',
    endIcon: '🏝️',
    flower: { fill: 'rgba(255, 183, 77, 0.5)', stroke: 'rgba(255, 160, 0, 0.4)', icon: '🐚' },
    grass: { fill: 'rgba(144, 202, 249, 0.5)', stroke: 'rgba(25, 118, 210, 0.3)', icon: '🌊' },
    stone: { fill: 'rgba(176, 190, 197, 0.5)', stroke: 'rgba(84, 110, 122, 0.4)', icon: '🪸' },
  },
};

export interface MapConfig {
  id: string;
  name: string;
  chapter: ChapterId;
  /** 本关可用的塔类型，按引入顺序 */
  allowedTowers: TowerTypeKey[];
  pathPoints: { x: number; y: number }[];
  pathCells: string[];
  decorations?: { col: number; row: number; type: 'grass' | 'stone' | 'flower' }[];
}

const CELL = 60;
const COLS = 15;
const C = (col: number, row: number) => ({ x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 });
const EXIT = COLS * CELL + 20;

function pathCellsFromSegments(segments: [number, number][]): string[] {
  const set = new Set<string>();
  for (let i = 0; i < segments.length - 1; i++) {
    const [c1, r1] = segments[i];
    const [c2, r2] = segments[i + 1];
    const dc = Math.sign(c2 - c1);
    const dr = Math.sign(r2 - r1);
    let c = c1, r = r1;
    while (c !== c2 || r !== r2) {
      set.add(`${c},${r}`);
      if (c !== c2) c += dc;
      if (r !== r2) r += dr;
    }
    set.add(`${c2},${r2}`);
  }
  return [...set];
}

const ALL: TowerTypeKey[] = ['arrow', 'cannon', 'slow', 'mage'];

const MAP_LIST: MapConfig[] = [
  { id: 'classic', name: '🌸 经典小路', chapter: 1, allowedTowers: ['arrow'], pathPoints: [C(0, 3), C(4, 3), C(4, 6), C(8, 6), C(8, 3), C(14, 3), { x: EXIT, y: C(14, 3).y }], pathCells: pathCellsFromSegments([[0, 3], [4, 3], [4, 6], [8, 6], [8, 3], [14, 3]]), decorations: [] },
  { id: 'maze', name: '🌿 小迷宫', chapter: 1, allowedTowers: ['arrow'], pathPoints: [C(0, 1), C(3, 1), C(3, 4), C(1, 4), C(1, 7), C(6, 7), C(6, 4), C(10, 4), C(10, 1), C(14, 1), { x: EXIT, y: C(14, 1).y }], pathCells: pathCellsFromSegments([[0, 1], [3, 1], [3, 4], [1, 4], [1, 7], [6, 7], [6, 4], [10, 4], [10, 1], [14, 1]]), decorations: [{ col: 5, row: 2, type: 'flower' }, { col: 7, row: 3, type: 'grass' }] },
  { id: 'spiral', name: '🌀 小漩涡', chapter: 1, allowedTowers: ['arrow', 'cannon'], pathPoints: [C(1, 0), C(1, 4), C(7, 4), C(7, 1), C(4, 1), C(4, 7), C(10, 7), C(10, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[1, 0], [1, 4], [7, 4], [7, 1], [4, 1], [4, 7], [10, 7], [10, 4], [14, 4]]), decorations: [{ col: 3, row: 2, type: 'stone' }, { col: 6, row: 3, type: 'flower' }] },
  { id: 'zigzag', name: '〰️ 之字形', chapter: 1, allowedTowers: ['arrow', 'cannon'], pathPoints: [C(0, 1), C(5, 1), C(5, 5), C(10, 5), C(10, 2), C(14, 2), { x: EXIT, y: C(14, 2).y }], pathCells: pathCellsFromSegments([[0, 1], [5, 1], [5, 5], [10, 5], [10, 2], [14, 2]]), decorations: [{ col: 2, row: 3, type: 'grass' }, { col: 8, row: 4, type: 'flower' }] },
  { id: 'snake', name: '🐍 小蛇道', chapter: 1, allowedTowers: ['arrow', 'cannon', 'slow'], pathPoints: [C(0, 2), C(3, 2), C(3, 6), C(7, 6), C(7, 2), C(11, 2), C(11, 6), C(14, 6), { x: EXIT, y: C(14, 6).y }], pathCells: pathCellsFromSegments([[0, 2], [3, 2], [3, 6], [7, 6], [7, 2], [11, 2], [11, 6], [14, 6]]), decorations: [{ col: 5, row: 4, type: 'stone' }, { col: 9, row: 4, type: 'grass' }] },
  { id: 'river', name: '🌊 小溪流', chapter: 2, allowedTowers: ['arrow', 'cannon', 'slow'], pathPoints: [C(0, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [14, 4]]), decorations: [{ col: 2, row: 2, type: 'flower' }, { col: 7, row: 6, type: 'grass' }, { col: 12, row: 3, type: 'flower' }] },
  { id: 'castle', name: '🏰 小城堡', chapter: 2, allowedTowers: ['arrow', 'cannon', 'slow', 'mage'], pathPoints: [C(0, 2), C(2, 2), C(2, 7), C(6, 7), C(6, 3), C(9, 3), C(9, 7), C(13, 7), C(13, 2), C(14, 2), { x: EXIT, y: C(14, 2).y }], pathCells: pathCellsFromSegments([[0, 2], [2, 2], [2, 7], [6, 7], [6, 3], [9, 3], [9, 7], [13, 7], [13, 2], [14, 2]]), decorations: [{ col: 4, row: 4, type: 'stone' }, { col: 10, row: 5, type: 'grass' }] },
  { id: 'garden', name: '🌷 小花园', chapter: 2, allowedTowers: ALL, pathPoints: [C(0, 5), C(4, 5), C(4, 1), C(8, 1), C(8, 5), C(12, 5), C(12, 2), C(14, 2), { x: EXIT, y: C(14, 2).y }], pathCells: pathCellsFromSegments([[0, 5], [4, 5], [4, 1], [8, 1], [8, 5], [12, 5], [12, 2], [14, 2]]), decorations: [{ col: 2, row: 3, type: 'flower' }, { col: 6, row: 3, type: 'flower' }, { col: 10, row: 4, type: 'flower' }] },
  { id: 'forest', name: '🌲 小森林', chapter: 2, allowedTowers: ALL, pathPoints: [C(0, 3), C(2, 3), C(2, 7), C(5, 7), C(5, 2), C(9, 2), C(9, 6), C(12, 6), C(12, 3), C(14, 3), { x: EXIT, y: C(14, 3).y }], pathCells: pathCellsFromSegments([[0, 3], [2, 3], [2, 7], [5, 7], [5, 2], [9, 2], [9, 6], [12, 6], [12, 3], [14, 3]]), decorations: [{ col: 4, row: 4, type: 'grass' }, { col: 8, row: 4, type: 'grass' }, { col: 6, row: 1, type: 'stone' }] },
  { id: 'beach', name: '🏖️ 小沙滩', chapter: 2, allowedTowers: ALL, pathPoints: [C(0, 6), C(6, 6), C(6, 1), C(14, 1), { x: EXIT, y: C(14, 1).y }], pathCells: pathCellsFromSegments([[0, 6], [6, 6], [6, 1], [14, 1]]), decorations: [{ col: 3, row: 4, type: 'flower' }, { col: 10, row: 4, type: 'grass' }] },
  { id: 'hills', name: '⛰️ 小山坡', chapter: 3, allowedTowers: ALL, pathPoints: [C(0, 4), C(3, 4), C(3, 1), C(7, 1), C(7, 5), C(11, 5), C(11, 2), C(14, 2), { x: EXIT, y: C(14, 2).y }], pathCells: pathCellsFromSegments([[0, 4], [3, 4], [3, 1], [7, 1], [7, 5], [11, 5], [11, 2], [14, 2]]), decorations: [{ col: 5, row: 3, type: 'stone' }, { col: 9, row: 3, type: 'grass' }] },
  { id: 'valley', name: '🏞️ 小山谷', chapter: 3, allowedTowers: ALL, pathPoints: [C(0, 2), C(5, 2), C(5, 7), C(9, 7), C(9, 2), C(14, 2), { x: EXIT, y: C(14, 2).y }], pathCells: pathCellsFromSegments([[0, 2], [5, 2], [5, 7], [9, 7], [9, 2], [14, 2]]), decorations: [{ col: 2, row: 4, type: 'flower' }, { col: 7, row: 4, type: 'stone' }, { col: 12, row: 5, type: 'grass' }] },
  { id: 'fortress', name: '🛡️ 小要塞', chapter: 3, allowedTowers: ALL, pathPoints: [C(0, 1), C(4, 1), C(4, 6), C(8, 6), C(8, 1), C(12, 1), C(12, 5), C(14, 5), { x: EXIT, y: C(14, 5).y }], pathCells: pathCellsFromSegments([[0, 1], [4, 1], [4, 6], [8, 6], [8, 1], [12, 1], [12, 5], [14, 5]]), decorations: [{ col: 6, row: 3, type: 'stone' }, { col: 10, row: 3, type: 'stone' }] },
  { id: 'bridge', name: '🌉 小桥梁', chapter: 3, allowedTowers: ALL, pathPoints: [C(0, 5), C(7, 5), C(7, 2), C(14, 2), { x: EXIT, y: C(14, 2).y }], pathCells: pathCellsFromSegments([[0, 5], [7, 5], [7, 2], [14, 2]]), decorations: [{ col: 3, row: 3, type: 'flower' }, { col: 11, row: 4, type: 'grass' }] },
  { id: 'corridor', name: '🚪 小走廊', chapter: 3, allowedTowers: ALL, pathPoints: [C(0, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [14, 4]]), decorations: [{ col: 4, row: 2, type: 'grass' }, { col: 9, row: 6, type: 'grass' }, { col: 7, row: 4, type: 'stone' }] },
  { id: 'loop', name: '🔄 小环线', chapter: 4, allowedTowers: ALL, pathPoints: [C(0, 4), C(5, 4), C(5, 1), C(10, 1), C(10, 7), C(5, 7), C(5, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [5, 4], [5, 1], [10, 1], [10, 7], [5, 7], [5, 4], [14, 4]]), decorations: [{ col: 3, row: 2, type: 'flower' }, { col: 8, row: 4, type: 'grass' }] },
  { id: 'diamond', name: '💎 小钻石', chapter: 4, allowedTowers: ALL, pathPoints: [C(0, 4), C(4, 4), C(4, 1), C(7, 4), C(10, 1), C(10, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [4, 4], [4, 1], [7, 4], [10, 1], [10, 4], [14, 4]]), decorations: [{ col: 2, row: 2, type: 'stone' }, { col: 12, row: 2, type: 'flower' }] },
  { id: 'star', name: '⭐ 小星星', chapter: 4, allowedTowers: ALL, pathPoints: [C(0, 4), C(3, 4), C(3, 1), C(5, 4), C(7, 1), C(7, 5), C(5, 7), C(3, 5), C(3, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [3, 4], [3, 1], [5, 4], [7, 1], [7, 5], [5, 7], [3, 5], [3, 4], [14, 4]]), decorations: [{ col: 5, row: 4, type: 'flower' }, { col: 9, row: 4, type: 'grass' }] },
  { id: 'butterfly', name: '🦋 小蝴蝶', chapter: 4, allowedTowers: ALL, pathPoints: [C(0, 4), C(3, 4), C(3, 1), C(7, 4), C(11, 1), C(11, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [3, 4], [3, 1], [7, 4], [11, 1], [11, 4], [14, 4]]), decorations: [{ col: 5, row: 2, type: 'flower' }, { col: 9, row: 2, type: 'flower' }, { col: 7, row: 6, type: 'stone' }] },
  { id: 'heart', name: '💖 小心形', chapter: 4, allowedTowers: ALL, pathPoints: [C(0, 4), C(2, 4), C(2, 2), C(5, 5), C(8, 2), C(8, 4), C(11, 4), C(11, 6), C(8, 6), C(5, 4), C(2, 6), C(2, 4), C(14, 4), { x: EXIT, y: C(14, 4).y }], pathCells: pathCellsFromSegments([[0, 4], [2, 4], [2, 2], [5, 5], [8, 2], [8, 4], [11, 4], [11, 6], [8, 6], [5, 4], [2, 6], [2, 4], [14, 4]]), decorations: [{ col: 5, row: 3, type: 'flower' }, { col: 8, row: 5, type: 'grass' }] },
];

export type MapId = MapConfig['id'];
export const MAPS: Record<string, MapConfig> = Object.fromEntries(MAP_LIST.map((m) => [m.id, m]));

const BASE_WAVES: EnemyTypeKey[][] = [
  ['goblin', 'goblin', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'wolf', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'tank', 'wolf', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'wolf', 'tank', 'tank', 'wolf', 'goblin'],
  ['goblin', 'wolf', 'wolf', 'tank', 'tank', 'wolf', 'boss', 'goblin', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'wolf', 'tank', 'tank', 'boss', 'boss', 'goblin', 'goblin'],
];

export function getWavesForDifficulty(d: DifficultyKey): EnemyTypeKey[][] {
  const cfg = DIFFICULTIES[d];
  const waves: EnemyTypeKey[][] = [];
  for (let i = 0; i < cfg.waveCount; i++) {
    waves.push(generateWave(i));
  }
  return waves;
}

function generateWave(index: number): EnemyTypeKey[] {
  const base = BASE_WAVES[Math.min(index, BASE_WAVES.length - 1)] ?? BASE_WAVES[BASE_WAVES.length - 1]!;
  if (index < BASE_WAVES.length) return [...base];
  const extra = Math.floor(index / 2);
  const result: EnemyTypeKey[] = [...base];
  for (let i = 0; i < extra; i++) {
    const r = Math.random();
    if (r < 0.3) result.push('goblin');
    else if (r < 0.55) result.push('wolf');
    else if (r < 0.8) result.push('tank');
    else result.push('boss');
  }
  return result;
}

export function getWaveForEndless(_difficulty: DifficultyKey, waveIndex: number): EnemyTypeKey[] {
  return generateWave(waveIndex);
}

export const SKILL_COST = 100;
export const SKILL_FREEZE_DURATION = 3000;
export const SKILL_NUKE_DAMAGE = 200;
export const SKILL_CD_MS = 15000;

export type GameMode = 'campaign' | 'endless';

export interface GameSettings {
  soundEnabled: boolean;
  difficulty: DifficultyKey;
  mapId: MapId;
  mode: GameMode;
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  difficulty: 'normal',
  mapId: 'classic',
  mode: 'campaign',
};

const STORAGE_KEY = 'td-game-settings';

const LEGACY_MAP_IDS: Record<string, string> = { default: 'classic' };

export function loadSettings(): GameSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Partial<GameSettings>;
      let mapId = parsed.mapId ?? 'classic';
      mapId = LEGACY_MAP_IDS[mapId] ?? mapId;
      if (!MAPS[mapId]) mapId = 'classic';
      return { ...DEFAULT_SETTINGS, ...parsed, mode: parsed.mode ?? 'campaign', mapId };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

const SCORES_KEY = 'td-high-scores';

export const WAVE_BONUS = 30;

export interface StoredScores {
  victories: number;
  bestWave: number;
}

export function loadScores(): StoredScores {
  try {
    const s = localStorage.getItem(SCORES_KEY);
    if (s) {
      return JSON.parse(s) as StoredScores;
    }
  } catch {}
  return { victories: 0, bestWave: 0 };
}

export function saveScores(scores: StoredScores): void {
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {}
}

const ACHIEVEMENTS_KEY = 'td-achievements';

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_win', name: '初战告捷', desc: '赢得第一场游戏', icon: '🏆' },
  { id: 'five_wins', name: '常胜将军', desc: '累计胜利5次', icon: '⭐' },
  { id: 'wave_5', name: '坚守阵地', desc: '通关第5波', icon: '🛡️' },
  { id: 'full_lives', name: '完美防守', desc: '通关且生命值未减少', icon: '💎' },
  { id: 'ten_towers', name: '防御大师', desc: '同时拥有10座塔', icon: '🗼' },
  { id: 'no_sell', name: '精打细算', desc: '胜利且从未出售塔', icon: '📦' },
];

export function loadAchievements(): Set<string> {
  try {
    const s = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (s) return new Set(JSON.parse(s) as string[]);
  } catch {}
  return new Set();
}

export function saveAchievements(unlocked: Set<string>): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...unlocked]));
  } catch {}
}
