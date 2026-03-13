/**
 * 游戏配置：难度、地图、设置
 */

import type { EnemyTypeKey } from './enemy';

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

export type MapId = 'default' | 'maze' | 'spiral';

export interface MapConfig {
  id: MapId;
  name: string;
  pathPoints: { x: number; y: number }[];
  pathCells: string[];
  decorations?: { col: number; row: number; type: 'grass' | 'stone' }[];
}

const CELL = 60;
const COLS = 15;

export const MAPS: Record<MapId, MapConfig> = {
  default: {
    id: 'default',
    name: '经典路径',
    pathPoints: [
      { x: 0, y: 3 * CELL + CELL / 2 },
      { x: 4 * CELL + CELL / 2, y: 3 * CELL + CELL / 2 },
      { x: 4 * CELL + CELL / 2, y: 6 * CELL + CELL / 2 },
      { x: 8 * CELL + CELL / 2, y: 6 * CELL + CELL / 2 },
      { x: 8 * CELL + CELL / 2, y: 3 * CELL + CELL / 2 },
      { x: 12 * CELL + CELL / 2, y: 3 * CELL + CELL / 2 },
      { x: COLS * CELL + 20, y: 3 * CELL + CELL / 2 },
    ],
    pathCells: [
      '0,3', '1,3', '2,3', '3,3', '4,3',
      '4,4', '4,5', '4,6', '5,6', '6,6', '7,6', '8,6',
      '8,5', '8,4', '8,3', '9,3', '10,3', '11,3', '12,3', '13,3', '14,3',
    ],
    decorations: [],
  },
  maze: {
    id: 'maze',
    name: '迷宫',
    pathPoints: [
      { x: 0, y: 1 * CELL + CELL / 2 },
      { x: 3 * CELL + CELL / 2, y: 1 * CELL + CELL / 2 },
      { x: 3 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: 1 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: 1 * CELL + CELL / 2, y: 7 * CELL + CELL / 2 },
      { x: 6 * CELL + CELL / 2, y: 7 * CELL + CELL / 2 },
      { x: 6 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: 10 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: 10 * CELL + CELL / 2, y: 1 * CELL + CELL / 2 },
      { x: COLS * CELL + 20, y: 1 * CELL + CELL / 2 },
    ],
    pathCells: [
      '0,1', '1,1', '2,1', '3,1',
      '3,2', '3,3', '3,4', '2,4', '1,4',
      '1,5', '1,6', '1,7', '2,7', '3,7', '4,7', '5,7', '6,7',
      '6,6', '6,5', '6,4', '7,4', '8,4', '9,4', '10,4',
      '10,3', '10,2', '10,1', '11,1', '12,1', '13,1', '14,1',
    ],
    decorations: [
      { col: 5, row: 2, type: 'stone' }, { col: 7, row: 3, type: 'grass' },
      { col: 11, row: 5, type: 'stone' }, { col: 2, row: 5, type: 'grass' },
    ],
  },
  spiral: {
    id: 'spiral',
    name: '螺旋',
    pathPoints: [
      { x: 1 * CELL + CELL / 2, y: 0 },
      { x: 1 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: 7 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: 7 * CELL + CELL / 2, y: 1 * CELL + CELL / 2 },
      { x: 4 * CELL + CELL / 2, y: 1 * CELL + CELL / 2 },
      { x: 4 * CELL + CELL / 2, y: 7 * CELL + CELL / 2 },
      { x: 10 * CELL + CELL / 2, y: 7 * CELL + CELL / 2 },
      { x: 10 * CELL + CELL / 2, y: 4 * CELL + CELL / 2 },
      { x: COLS * CELL + 20, y: 4 * CELL + CELL / 2 },
    ],
    pathCells: [
      '1,0', '1,1', '1,2', '1,3', '1,4',
      '2,4', '3,4', '4,4', '5,4', '6,4', '7,4',
      '7,3', '7,2', '7,1', '6,1', '5,1', '4,1',
      '4,2', '4,3', '4,4', '4,5', '4,6', '4,7',
      '5,7', '6,7', '7,7', '8,7', '9,7', '10,7',
      '10,6', '10,5', '10,4', '11,4', '12,4', '13,4', '14,4',
    ],
    decorations: [
      { col: 3, row: 2, type: 'grass' }, { col: 6, row: 3, type: 'stone' },
      { col: 9, row: 5, type: 'grass' }, { col: 2, row: 6, type: 'stone' },
    ],
  },
};

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
  mapId: 'default',
  mode: 'campaign',
};

const STORAGE_KEY = 'td-game-settings';

export function loadSettings(): GameSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Partial<GameSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed, mode: parsed.mode ?? 'campaign' };
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
