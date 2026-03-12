import { Enemy } from './enemy';
import type { EnemyTypeKey } from './enemy';
import { Tower, TOWER_TYPES, type TowerTypeKey } from './tower';
import { cellCenter, canPlaceTower, screenToCell } from './path';
import { distance } from './utils';
import { createDeathParticles, createHitParticles, createSplashParticles, updateParticle, type Particle } from './particles';
import * as sound from './sound';

const INITIAL_GOLD = 250;
const INITIAL_LIVES = 20;

const WAVES: EnemyTypeKey[][] = [
  ['goblin', 'goblin', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'wolf', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'tank', 'wolf', 'goblin'],
  ['goblin', 'goblin', 'wolf', 'wolf', 'tank', 'tank', 'wolf', 'goblin'],
  ['goblin', 'wolf', 'wolf', 'tank', 'tank', 'wolf', 'boss', 'goblin', 'goblin'],
];

export type GameOverReason = 'victory' | 'defeat' | null;

export interface GameState {
  gold: number;
  lives: number;
  wave: number;
  waveQueue: number;
  totalInWave: number;
  aliveCount: number;
  gameOver: GameOverReason;
}

export class Game {
  gold: number;
  lives: number;
  wave: number;
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  projectiles: import('./projectile').Projectile[] = [];
  particles: Particle[] = [];
  enemyId = 0;
  towerId = 0;
  waveQueue: EnemyTypeKey[] = [];
  spawnTimer = 0;
  spawnInterval = 800;
  playing = false;
  gameOver: GameOverReason = null;

  onStateChange?: (state: GameState) => void;

  constructor() {
    this.gold = INITIAL_GOLD;
    this.lives = INITIAL_LIVES;
    this.wave = 0;
  }

  private emitState(): void {
    this.onStateChange?.(this.getState());
  }

  getState(): GameState {
    const total = WAVES[this.wave - 1]?.length ?? 0;
    return {
      gold: this.gold,
      lives: this.lives,
      wave: this.wave,
      waveQueue: this.waveQueue.length,
      totalInWave: total,
      aliveCount: this.enemies.filter((e) => e.alive).length,
      gameOver: this.gameOver,
    };
  }

  reset(): void {
    this.gold = INITIAL_GOLD;
    this.lives = INITIAL_LIVES;
    this.wave = 0;
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.particles = [];
    this.enemyId = 0;
    this.towerId = 0;
    this.waveQueue = [];
    this.spawnTimer = 0;
    this.playing = false;
    this.gameOver = null;
    this.emitState();
  }

  startWave(): void {
    if (this.gameOver) return;
    if (this.waveQueue.length > 0) return;
    this.wave++;
    if (this.wave > WAVES.length) {
      this.gameOver = 'victory';
      sound.playVictory();
      this.emitState();
      return;
    }
    this.waveQueue = [...WAVES[this.wave - 1]];
    this.playing = true;
    sound.playWaveStart();
    this.emitState();
  }

  private applySplashDamage(x: number, y: number, damage: number, radius: number): void {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const pos = e.getPosition();
      const d = distance(x, y, pos.x, pos.y);
      if (d < radius) {
        const falloff = 1 - (d / radius) * 0.5;
        e.takeDamage(Math.floor(damage * falloff));
        if (!e.alive) {
          this.gold += e.claimReward();
          this.particles.push(...createDeathParticles(pos.x, pos.y, e.color));
          sound.playDeath();
        }
      }
    }
    this.particles.push(...createSplashParticles(x, y));
    sound.playSplash();
  }

  update(dt: number): void {
    if (this.gameOver) return;

    if (this.waveQueue.length > 0) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        const type = this.waveQueue.shift()!;
        this.enemies.push(new Enemy(type, this.enemyId++));
      }
    }

    for (const e of this.enemies) {
      const result = e.update(dt);
      if (result === 'reached_end') {
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver = 'defeat';
          sound.playDefeat();
        }
      } else {
        const reward = e.claimReward();
        if (reward > 0) {
          const pos = e.getPosition();
          this.particles.push(...createDeathParticles(pos.x, pos.y, e.color));
          sound.playDeath();
        }
        this.gold += reward;
      }
    }

    const now = Date.now();
    for (const t of this.towers) {
      const proj = t.tryShoot(this.enemies, now);
      if (proj) {
        this.projectiles.push(proj);
        sound.playShoot();
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const onSplash = p.splashRadius > 0
        ? (x: number, y: number, dmg: number, r: number) =>
            this.applySplashDamage(x, y, dmg, r)
        : undefined;
      if (p.update(dt, onSplash)) {
        if (!p.splashRadius && p.hit) {
          this.particles.push(...createHitParticles(p.x, p.y));
          sound.playHit();
        }
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!updateParticle(this.particles[i], dt)) {
        this.particles.splice(i, 1);
      }
    }

    if (
      this.playing &&
      this.waveQueue.length === 0 &&
      this.enemies.every((e) => !e.alive) &&
      this.wave >= WAVES.length
    ) {
      this.gameOver = 'victory';
      sound.playVictory();
    }

    this.emitState();
  }

  tryPlaceTower(typeKey: TowerTypeKey, cellX: number, cellY: number): boolean {
    const cell = screenToCell(cellX, cellY);
    if (!cell || !canPlaceTower(cell.col, cell.row)) return false;
    const config = TOWER_TYPES[typeKey];
    if (!config) throw new Error(`Unknown tower type: ${typeKey}`);
    if (this.gold < config.cost) return false;
    const occupied = this.towers.some(
      (t) =>
        Math.floor(t.x / 60) === cell.col && Math.floor(t.y / 60) === cell.row
    );
    if (occupied) return false;
    const { x, y } = cellCenter(cell.col, cell.row);
    this.towers.push(new Tower(typeKey, x, y, this.towerId++));
    this.gold -= config.cost;
    this.emitState();
    return true;
  }

  getAliveEnemies(): Enemy[] {
    return this.enemies.filter((e) => e.alive);
  }
}
