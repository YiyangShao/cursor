import type { MapConfig } from './config';

const CELL_SIZE = 60;
const COLS = 15;
const ROWS = 10;

export interface Point {
  x: number;
  y: number;
}

let currentMap: MapConfig | null = null;

export function setMap(map: MapConfig): void {
  currentMap = map;
}

export function getPathPoints(): Point[] {
  if (!currentMap) return [];
  return currentMap.pathPoints;
}

export function isPathCell(col: number, row: number): boolean {
  if (!currentMap) return false;
  return currentMap.pathCells.includes(`${col},${row}`);
}

export const GRID_CONFIG = {
  CELL_SIZE,
  COLS,
  ROWS,
  WIDTH: COLS * CELL_SIZE,
  HEIGHT: ROWS * CELL_SIZE,
};

export function cellCenter(col: number, row: number): Point {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}

export function screenToCell(x: number, y: number): { col: number; row: number } | null {
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
  return { col, row };
}

export function canPlaceTower(col: number, row: number): boolean {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  return !isPathCell(col, row);
}

function segmentLength(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getPathLength(points: Point[]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += segmentLength(points[i], points[i + 1]);
  }
  return len;
}

export function getPathPosition(progress: number): Point {
  const points = getPathPoints();
  if (points.length === 0) return { x: 0, y: 0 };
  if (progress >= 1) return points[points.length - 1];
  const totalLen = getPathLength(points);
  const targetLen = progress * totalLen;
  let acc = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segLen = segmentLength(points[i], points[i + 1]);
    if (acc + segLen >= targetLen) {
      const t = (targetLen - acc) / segLen;
      return {
        x: points[i].x + t * (points[i + 1].x - points[i].x),
        y: points[i].y + t * (points[i + 1].y - points[i].y),
      };
    }
    acc += segLen;
  }
  return points[points.length - 1];
}

export function getMapDecorations(): { col: number; row: number; type: 'grass' | 'stone' | 'flower' }[] {
  return currentMap?.decorations ?? [];
}

export function getCurrentMap(): MapConfig | null {
  return currentMap;
}
