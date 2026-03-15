/**
 * Phaser 游戏配置 + 游戏数值配置
 */

export const TILE_SIZE = 40;
export const GRID_COLS = 15;
export const GRID_ROWS = 10;
export const OFFSET_X = 60;
export const OFFSET_Y = 60;

/** 路径：格子坐标序列 (col, row) */
export const PATH_TILES: [number, number][] = [
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [7, 4],
  [8, 4],
  [9, 4],
  [10, 4],
  [11, 4],
  [12, 4],
  [13, 4],
  [14, 4],
];

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: OFFSET_X * 2 + GRID_COLS * TILE_SIZE,
  height: OFFSET_Y * 2 + GRID_ROWS * TILE_SIZE,
  backgroundColor: '#1a1a2e',
  scene: [],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
