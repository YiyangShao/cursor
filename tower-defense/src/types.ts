/**
 * 共享类型定义
 */

export type TowerType = 'cannon' | 'slow' | 'splash';
export type EnemyType = 'normal' | 'fast';

export interface GridCoord {
  col: number;
  row: number;
}

export interface WorldPoint {
  x: number;
  y: number;
}
