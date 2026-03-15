import type { TowerType } from '../types';

export interface TowerConfig {
  type: TowerType;
  damage: number;
  range: number; // 像素
  fireRate: number; // 毫秒 / 次
  cost: number;
  /** 减速塔：减速比例 0..1 */
  slowPercent?: number;
  /** 溅射塔：范围半径像素 */
  splashRadius?: number;
}

/** 2级升级倍率 */
export const UPGRADE_MULTIPLIER = 1.5;
export const UPGRADE_COST = 80;

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  cannon: {
    type: 'cannon',
    damage: 20,
    range: 120,
    fireRate: 1000,
    cost: 100,
  },
  slow: {
    type: 'slow',
    damage: 10,
    range: 120,
    fireRate: 666,
    cost: 120,
    slowPercent: 0.3,
  },
  splash: {
    type: 'splash',
    damage: 40,
    range: 80,
    fireRate: 1428,
    cost: 150,
    splashRadius: 60,
  },
};
