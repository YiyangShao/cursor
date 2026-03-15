import type { GridCoord, WorldPoint } from '../types';
import {
  OFFSET_X,
  OFFSET_Y,
  PATH_TILES,
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from '../config';

const pathSet = new Set(PATH_TILES.map(([c, r]) => `${c},${r}`));

/** 格子坐标转世界坐标（格子中心） */
export function gridToWorld(col: number, row: number): WorldPoint {
  return {
    x: OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2,
    y: OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2,
  };
}

/** 世界坐标转格子坐标 */
export function worldToGrid(x: number, y: number): GridCoord {
  const col = Math.floor((x - OFFSET_X) / TILE_SIZE);
  const row = Math.floor((y - OFFSET_Y) / TILE_SIZE);
  return { col, row };
}

/** 该格子是否为路径（不可放置塔） */
export function isPathTile(col: number, row: number): boolean {
  return pathSet.has(`${col},${row}`);
}

/** 该格子是否可放置塔（在范围内且非路径） */
export function canPlaceTower(col: number, row: number): boolean {
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
    return false;
  }
  return !isPathTile(col, row);
}

/** 路径上的世界坐标序列（用于敌人移动） */
export function getPathWorldPoints(): WorldPoint[] {
  return PATH_TILES.map(([col, row]) => gridToWorld(col, row));
}

/** 根据路径进度 [0,1] 获取世界坐标 */
export function getPointOnPath(progress: number): WorldPoint {
  const points = getPathWorldPoints();
  if (points.length === 0) {
    throw new Error('Path has no points');
  }
  if (points.length === 1) {
    return points[0];
  }
  const totalLen = points.length - 1;
  const seg = progress * totalLen;
  const idx = Math.min(Math.floor(seg), points.length - 2);
  const t = seg - idx;
  const a = points[idx];
  const b = points[idx + 1];
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}
