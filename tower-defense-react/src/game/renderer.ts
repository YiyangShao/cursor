import { getPathPoints, GRID_CONFIG, isPathCell, cellCenter, getMapDecorations, getCurrentMap, screenToCell } from './path';
import type { Game } from './game';
import type { Tower } from './tower';
import type { Enemy } from './enemy';
import type { Projectile } from './projectile';
import type { Particle } from './particles';
import { TOWER_TYPES, getTowerIconAtLevel, type TowerTypeKey } from './tower';
import { CHAPTER_STYLES, type ChapterId } from './config';
import { getAssets, getTowerSprite, getEnemySprite, drawSprite } from './assets';

const { CELL_SIZE, COLS, ROWS } = GRID_CONFIG;

function getChapterStyle() {
  const map = getCurrentMap();
  const ch: ChapterId = map?.chapter ?? 1;
  return CHAPTER_STYLES[ch];
}

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
  drawProjectileTrajectories(ctx, game.projectiles);
  drawEnemies(ctx, game.getAliveEnemies());
  drawParticles(ctx, game.particles);
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const a = getAssets();
  const ground = a.tiles?.ground;
  if (ground) {
    const w = ground.naturalWidth;
    const h = ground.naturalHeight;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.drawImage(ground, 0, 0, w, h, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  } else {
    const s = getChapterStyle();
    const grad = ctx.createLinearGradient(0, 0, 0, ROWS * CELL_SIZE);
    s.background.forEach((c, i) => grad.addColorStop(i / (s.background.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);
  }
}

function drawDecorations(ctx: CanvasRenderingContext2D): void {
  const s = getChapterStyle();
  const deco = getMapDecorations();
  for (const d of deco) {
    const x = d.col * CELL_SIZE + CELL_SIZE / 2;
    const y = d.row * CELL_SIZE + CELL_SIZE / 2;
    {
      const style = d.type === 'flower' ? s.flower : d.type === 'grass' ? s.grass : s.stone;
      ctx.fillStyle = style.fill;
      if (d.type === 'stone') {
        const r = 6, w = CELL_SIZE - 12, h = CELL_SIZE - 12, x0 = d.col * CELL_SIZE + 6, y0 = d.row * CELL_SIZE + 6;
        ctx.beginPath();
        ctx.moveTo(x0 + r, y0);
        ctx.lineTo(x0 + w - r, y0);
        ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
        ctx.lineTo(x0 + w, y0 + h - r);
        ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
        ctx.lineTo(x0 + r, y0 + h);
        ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
        ctx.lineTo(x0, y0 + r);
        ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = d.type === 'stone' ? 1 : 2;
      ctx.stroke();
      ctx.fillStyle = style.stroke;
      ctx.font = `bold ${d.type === 'stone' ? 16 : 18}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style.icon, x, y);
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
    ctx.strokeStyle = 'rgba(129, 199, 132, 0.8)';
    ctx.fillStyle = 'rgba(129, 199, 132, 0.25)';
  } else {
    ctx.strokeStyle = 'rgba(229, 115, 115, 0.8)';
    ctx.fillStyle = 'rgba(229, 115, 115, 0.25)';
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

  const a = getAssets();
  const towerImg = getTowerSprite(preview.towerType, 1);
  if (a.ready && towerImg) {
    drawSprite(ctx, towerImg, x, y, cfg.radius * 2);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.iconL1, x, y);
  }
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
  ctx.strokeStyle = 'rgba(255, 183, 77, 0.9)';
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
  ctx.strokeStyle = getChapterStyle().gridStroke;
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
  const s = getChapterStyle();
  const PATH_POINTS = getPathPoints();
  if (PATH_POINTS.length < 2) return;

  ctx.strokeStyle = s.pathStroke;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
  for (let i = 1; i < PATH_POINTS.length; i++) {
    ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
  }
  ctx.stroke();

  const pathTile = getAssets().tiles?.path;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isPathCell(c, r)) {
        if (pathTile) {
          const w = pathTile.naturalWidth;
          const h = pathTile.naturalHeight;
          ctx.drawImage(pathTile, 0, 0, w, h, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = s.pathCellFill;
          ctx.fillRect(c * CELL_SIZE + 3, r * CELL_SIZE + 3, CELL_SIZE - 6, CELL_SIZE - 6);
          ctx.strokeStyle = s.pathCellStroke;
          ctx.lineWidth = 2;
          ctx.strokeRect(c * CELL_SIZE + 3, r * CELL_SIZE + 3, CELL_SIZE - 6, CELL_SIZE - 6);
        }
      }
    }
  }

  const start = PATH_POINTS[0];
  {
    ctx.fillStyle = s.startFill;
    ctx.beginPath();
    ctx.arc(start.x, start.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = s.startStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = s.startStroke;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.startIcon, start.x, start.y);
  }

  const end = PATH_POINTS[PATH_POINTS.length - 1];
  {
    ctx.fillStyle = s.endFill;
    ctx.beginPath();
    ctx.arc(end.x, end.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = s.endStroke;
    ctx.stroke();
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = s.endStroke;
    ctx.fillText(s.endIcon, end.x, end.y);
  }
}

function drawTowers(ctx: CanvasRenderingContext2D, towers: Tower[]): void {
  const a = getAssets();
  for (const t of towers) {
    const sizeBonus = t.level === 1 ? 0 : t.level === 2 ? 3 : 6;
    const r = t.radius + sizeBonus;
    const icon = getTowerIconAtLevel(t.type, t.level);
    ctx.save();
    ctx.translate(t.x, t.y);
    if (t.shootFlash > 0) {
      ctx.shadowColor = t.color;
      ctx.shadowBlur = (15 + t.level * 5) * t.shootFlash;
    }
    const towerImg = getTowerSprite(t.type, t.level);
    if (a.ready && towerImg) {
      drawSprite(ctx, towerImg, 0, 0, (t.radius + sizeBonus) * 2.2, { rotate: t.aimAngle });
    } else {
      const lineW = t.level === 1 ? 2 : t.level === 2 ? 2.5 : 3;
      const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, r + 8);
      gradient.addColorStop(0, t.color);
      gradient.addColorStop(1, adjustColor(t.color, 0.55));
      ctx.fillStyle = gradient;
      ctx.strokeStyle = t.level === 3 ? 'rgba(255,215,0,0.9)' : 'rgba(255,255,255,0.65)';
      ctx.lineWidth = lineW;
      ctx.rotate(t.aimAngle);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.rotate(-t.aimAngle);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${18 + t.level * 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 0, 0);
    }
    ctx.shadowBlur = 0;
    if (t.level > 1) {
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(`Lv${t.level}`, 0, r + 8);
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

function drawProjectileTrajectories(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const p of projectiles) {
    ctx.strokeStyle = p.splashRadius > 0 ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 235, 59, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(p.originX, p.originY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
  const a = getAssets();
  for (const e of enemies) {
    const pos = e.getPosition();
    const pct = e.hp / e.maxHp;
    const size = e.radius * 2.2;
    const enemyImg = getEnemySprite(e.type);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (a.ready && enemyImg) {
      drawSprite(ctx, enemyImg, 0, 0, (e.radius + 2) * 2.8);
    } else {
      ctx.fillStyle = e.color + '40';
      ctx.strokeStyle = e.color + '99';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `bold ${Math.round(size)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.sprite, 0, 0);
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(
      pos.x - e.radius - 2,
      pos.y - e.radius - 14,
      e.radius * 2 + 4,
      6
    );
    ctx.fillStyle = pct > 0.5 ? '#81c784' : pct > 0.25 ? '#ffb74d' : '#e57373';
    ctx.fillRect(
      pos.x - e.radius - 2,
      pos.y - e.radius - 14,
      (e.radius * 2 + 4) * pct,
      6
    );
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
