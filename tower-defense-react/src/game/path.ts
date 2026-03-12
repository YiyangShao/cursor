const CELL_SIZE = 60;
const COLS = 15;
const ROWS = 10;

export interface Point {
  x: number;
  y: number;
}

export const PATH_POINTS: Point[] = [
  { x: 0, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 4 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 4 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 8 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 8 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 12 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
  { x: COLS * CELL_SIZE + 20, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
];

const PATH_CELLS = new Set([
  '0,3', '1,3', '2,3', '3,3', '4,3',
  '4,4', '4,5', '4,6',
  '5,6', '6,6', '7,6', '8,6',
  '8,5', '8,4', '8,3',
  '9,3', '10,3', '11,3', '12,3', '13,3', '14,3',
]);

export const GRID_CONFIG = {
  CELL_SIZE,
  COLS,
  ROWS,
  WIDTH: COLS * CELL_SIZE,
  HEIGHT: ROWS * CELL_SIZE,
};

export function isPathCell(col: number, row: number): boolean {
  return PATH_CELLS.has(`${col},${row}`);
}

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

function getPathLength(): number {
  let len = 0;
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    len += segmentLength(PATH_POINTS[i], PATH_POINTS[i + 1]);
  }
  return len;
}

export function getPathPosition(progress: number): Point {
  if (progress >= 1) return PATH_POINTS[PATH_POINTS.length - 1];
  const totalLen = getPathLength();
  const targetLen = progress * totalLen;
  let acc = 0;
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const segLen = segmentLength(PATH_POINTS[i], PATH_POINTS[i + 1]);
    if (acc + segLen >= targetLen) {
      const t = (targetLen - acc) / segLen;
      return {
        x: PATH_POINTS[i].x + t * (PATH_POINTS[i + 1].x - PATH_POINTS[i].x),
        y: PATH_POINTS[i].y + t * (PATH_POINTS[i + 1].y - PATH_POINTS[i].y),
      };
    }
    acc += segLen;
  }
  return PATH_POINTS[PATH_POINTS.length - 1];
}
