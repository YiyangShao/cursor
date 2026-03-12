import { PATH_POINTS, GRID_CONFIG, isPathCell } from './path';
import type { Game } from './game';
import type { Tower } from './tower';
import type { Enemy } from './enemy';
import type { Projectile } from './projectile';
import type { Particle } from './particles';

const { CELL_SIZE, COLS, ROWS } = GRID_CONFIG;

export function render(
  ctx: CanvasRenderingContext2D,
  game: Game
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawGrid(ctx);
  drawPath(ctx);
  drawTowers(ctx, game.towers);
  drawProjectiles(ctx, game.projectiles);
  drawEnemies(ctx, game.getAliveEnemies());
  drawParticles(ctx, game.particles);
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
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
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
  for (let i = 1; i < PATH_POINTS.length; i++) {
    ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(100, 150, 255, 0.15)';
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
  ctx.lineWidth = 2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isPathCell(c, r)) {
        ctx.fillRect(c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.strokeRect(c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    }
  }

  const end = PATH_POINTS[PATH_POINTS.length - 1];
  ctx.fillStyle = 'rgba(255, 80, 80, 0.3)';
  ctx.beginPath();
  ctx.arc(end.x, end.y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 80, 80, 0.6)';
  ctx.stroke();
}

function drawTowers(ctx: CanvasRenderingContext2D, towers: Tower[]): void {
  for (const t of towers) {
    const gradient = ctx.createRadialGradient(
      t.x - 5, t.y - 5, 0,
      t.x, t.y, t.radius + 5
    );
    gradient.addColorStop(0, t.color);
    gradient.addColorStop(1, adjustColor(t.color, 0.6));

    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.icon, t.x, t.y);
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const p of projectiles) {
    ctx.fillStyle = p.splashRadius > 0 ? '#ff9800' : '#ffeb3b';
    ctx.shadowColor = p.splashRadius > 0 ? '#ff9800' : '#ffeb3b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.splashRadius > 0 ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
  for (const e of enemies) {
    const pos = e.getPosition();
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = e.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(pos.x - e.radius - 2, pos.y - e.radius - 10, e.radius * 2 + 4, 5);
    ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
    ctx.fillRect(pos.x - e.radius - 2, pos.y - e.radius - 10, (e.radius * 2 + 4) * pct, 5);
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1 - alpha * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
}

function adjustColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}
