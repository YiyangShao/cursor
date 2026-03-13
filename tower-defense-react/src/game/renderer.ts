import { getPathPoints, GRID_CONFIG, isPathCell, cellCenter, getMapDecorations, screenToCell } from './path';
import type { Game } from './game';
import type { Tower } from './tower';
import type { Enemy } from './enemy';
import type { Projectile } from './projectile';
import type { Particle } from './particles';
import { TOWER_TYPES, type TowerTypeKey } from './tower';

const { CELL_SIZE, COLS, ROWS } = GRID_CONFIG;

export interface HoverPreview {
  col: number;
  row: number;
  towerType: TowerTypeKey;
  canPlace: boolean;
}

export function render(
  ctx: CanvasRenderingContext2D,
  game: Game,
  hoverPreview?: HoverPreview | null,
  selectedCell?: { x: number; y: number } | null
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawBackground(ctx);
  drawDecorations(ctx);
  drawGrid(ctx);
  drawPath(ctx);
  if (hoverPreview) drawHoverPreview(ctx, hoverPreview, game.towers);
  if (selectedCell) drawSelectedHighlight(ctx, game, selectedCell);
  drawTowers(ctx, game.towers);
  drawProjectiles(ctx, game.projectiles);
  drawEnemies(ctx, game.getAliveEnemies());
  drawParticles(ctx, game.particles);
  drawDamageTexts(ctx, game.damageTexts);
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const grad = ctx.createLinearGradient(0, 0, 0, ROWS * CELL_SIZE);
  grad.addColorStop(0, '#0f1419');
  grad.addColorStop(0.5, '#0a0a12');
  grad.addColorStop(1, '#0d0f14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);
}

function drawDecorations(ctx: CanvasRenderingContext2D): void {
  const deco = getMapDecorations();
  for (const d of deco) {
    const x = d.col * CELL_SIZE + CELL_SIZE / 2;
    const y = d.row * CELL_SIZE + CELL_SIZE / 2;
    if (d.type === 'grass') {
      ctx.fillStyle = 'rgba(60, 120, 60, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(100, 100, 110, 0.4)';
      ctx.fillRect(d.col * CELL_SIZE + 4, d.row * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
    }
  }
}

function drawHoverPreview(
  ctx: CanvasRenderingContext2D,
  preview: HoverPreview,
  towers: Tower[]
): void {
  const cfg = TOWER_TYPES[preview.towerType];
  if (!cfg) return;
  const stats = cfg.base;
  const { x, y } = cellCenter(preview.col, preview.row);
  const occupied = towers.some(
    (t) =>
      Math.floor(t.x / CELL_SIZE) === preview.col &&
      Math.floor(t.y / CELL_SIZE) === preview.row
  );

  ctx.save();
  if (preview.canPlace && !occupied) {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
  } else {
    ctx.strokeStyle = 'rgba(255, 82, 82, 0.6)';
    ctx.fillStyle = 'rgba(255, 82, 82, 0.15)';
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, stats.range, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle =
    preview.canPlace && !occupied ? cfg.color + '99' : cfg.color + '44';
  ctx.strokeStyle =
    preview.canPlace && !occupied
      ? 'rgba(255,255,255,0.5)'
      : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, cfg.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.icon, x, y);
  ctx.restore();
}

function drawSelectedHighlight(
  ctx: CanvasRenderingContext2D,
  game: Game,
  selected: { x: number; y: number }
): void {
  const cell = screenToCell(selected.x, selected.y);
  if (!cell) return;
  const tower = game.getTowerAt(selected.x, selected.y);
  if (!tower) return;
  const { x, y } = cellCenter(cell.col, cell.row);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 235, 59, 0.9)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(x, y, tower.range, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, tower.radius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL_SIZE, 0);
    ctx.lineTo(c * CELL_SIZE, ROWS * CELL_SIZE);
    ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL_SIZE);
    ctx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE);
    ctx.stroke();
  }
}

function drawPath(ctx: CanvasRenderingContext2D): void {
  const PATH_POINTS = getPathPoints();
  if (PATH_POINTS.length < 2) return;

  ctx.strokeStyle = 'rgba(100, 150, 255, 0.45)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
  for (let i = 1; i < PATH_POINTS.length; i++) {
    ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(100, 150, 255, 0.12)';
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.35)';
  ctx.lineWidth = 2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isPathCell(c, r)) {
        ctx.fillRect(
          c * CELL_SIZE + 2,
          r * CELL_SIZE + 2,
          CELL_SIZE - 4,
          CELL_SIZE - 4
        );
        ctx.strokeRect(
          c * CELL_SIZE + 2,
          r * CELL_SIZE + 2,
          CELL_SIZE - 4,
          CELL_SIZE - 4
        );
      }
    }
  }

  const start = PATH_POINTS[0];
  ctx.fillStyle = 'rgba(100, 200, 255, 0.35)';
  ctx.beginPath();
  ctx.arc(start.x, start.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
  ctx.stroke();

  const end = PATH_POINTS[PATH_POINTS.length - 1];
  ctx.fillStyle = 'rgba(255, 80, 80, 0.35)';
  ctx.beginPath();
  ctx.arc(end.x, end.y, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 80, 80, 0.7)';
  ctx.stroke();
}

function drawTowers(ctx: CanvasRenderingContext2D, towers: Tower[]): void {
  for (const t of towers) {
    ctx.save();
    ctx.translate(t.x, t.y);
    if (t.shootFlash > 0) {
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 15 * t.shootFlash;
    }
    const gradient = ctx.createRadialGradient(
      -5, -5, 0,
      0, 0, t.radius + 8
    );
    gradient.addColorStop(0, t.color);
    gradient.addColorStop(1, adjustColor(t.color, 0.55));
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    ctx.rotate(t.aimAngle);
    ctx.beginPath();
    ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(-t.aimAngle);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.icon, 0, 0);
    if (t.level > 1) {
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(`Lv${t.level}`, 0, t.radius + 8);
    }
    ctx.restore();
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const p of projectiles) {
    ctx.fillStyle = p.splashRadius > 0 ? '#ff9800' : '#ffeb3b';
    ctx.shadowColor = p.splashRadius > 0 ? '#ff9800' : '#ffeb3b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.splashRadius > 0 ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
  for (const e of enemies) {
    const pos = e.getPosition();
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = e.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(
      pos.x - e.radius - 2,
      pos.y - e.radius - 12,
      e.radius * 2 + 4,
      6
    );
    ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
    ctx.fillRect(
      pos.x - e.radius - 2,
      pos.y - e.radius - 12,
      (e.radius * 2 + 4) * pct,
      6
    );
  }
}

function drawDamageTexts(ctx: CanvasRenderingContext2D, texts: { x: number; y: number; value: number; life: number; maxLife: number }[]): void {
  for (const t of texts) {
    const alpha = 1 - t.life / t.maxLife;
    ctx.save();
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = `rgba(255, 230, 100, ${alpha})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const str = `-${t.value}`;
    ctx.strokeText(str, t.x, t.y);
    ctx.fillText(str, t.x, t.y);
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    const hex = p.color.startsWith('#')
      ? p.color
      : p.color.startsWith('rgb')
        ? p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba')
        : p.color;
    ctx.fillStyle =
      hex.startsWith('rgba') || hex.startsWith('rgb')
        ? hex
        : hex + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1 - alpha * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function adjustColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}
