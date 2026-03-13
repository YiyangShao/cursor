import { Enemy } from './enemy';
import type { EnemyTypeKey } from './enemy';
import { Tower, TOWER_TYPES, getTowerCost, type TowerTypeKey } from './tower';
import { cellCenter, canPlaceTower, screenToCell, setMap } from './path';
import { distance } from './utils';
import {
  createDeathParticles,
  createHitParticles,
  createSplashParticles,
  createFreezeParticles,
  updateParticle,
  type Particle,
} from './particles';
import * as sound from './sound';
import {
  MAPS,
  getWavesForDifficulty,
  getWaveForEndless,
  DIFFICULTIES,
  SKILL_COST,
  SKILL_FREEZE_DURATION,
  SKILL_NUKE_DAMAGE,
  SKILL_CD_MS,
  WAVE_BONUS,
  loadScores,
  saveScores,
  loadAchievements,
  saveAchievements,
  ACHIEVEMENTS,
  type GameSettings,
} from './config';

export type GameOverReason = 'victory' | 'defeat' | null;

export interface GameState {
  gold: number;
  lives: number;
  wave: number;
  totalWaves: number;
  waveQueue: number;
  totalInWave: number;
  aliveCount: number;
  gameOver: GameOverReason;
  paused: boolean;
  speed: number;
  skillFreezeReady: boolean;
  skillNukeReady: boolean;
  skillFreezeCooldown: number;
  skillNukeCooldown: number;
  nextWave: EnemyTypeKey[];
  totalKills: number;
  waveBonuses: number;
  startTime: number;
  hasSoldTower: boolean;
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
  paused = false;
  speed = 1;
  skillFreezeLastUse = 0;
  skillNukeLastUse = 0;
  settings: GameSettings;
  waves: EnemyTypeKey[][];
  totalKills = 0;
  waveBonuses = 0;
  startTime = 0;
  hasSoldTower = false;
  initialLives = 20;
  lastBonusWave = -1;

  onStateChange?: (state: GameState) => void;

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.waves = settings.mode === 'endless' ? [] : getWavesForDifficulty(settings.difficulty);
    const diff = DIFFICULTIES[settings.difficulty];
    this.gold = diff.initialGold;
    this.lives = diff.initialLives;
    this.initialLives = diff.initialLives;
    this.wave = 0;
    setMap(MAPS[settings.mapId]);
  }

  private get diff() {
    return DIFFICULTIES[this.settings.difficulty];
  }

  private emitState(): void {
    this.onStateChange?.(this.getState());
  }

  getState(): GameState {
    const currentWaveEnemies = this.settings.mode === 'endless'
      ? getWaveForEndless(this.settings.difficulty, this.wave - 1)
      : this.waves[this.wave - 1];
    const total = currentWaveEnemies?.length ?? 0;
    const now = Date.now();
    return {
      gold: this.gold,
      lives: this.lives,
      wave: this.wave,
      totalWaves: this.settings.mode === 'endless' ? Infinity : this.waves.length,
      waveQueue: this.waveQueue.length,
      totalInWave: total,
      aliveCount: this.enemies.filter((e) => e.alive).length,
      gameOver: this.gameOver,
      paused: this.paused,
      speed: this.speed,
      skillFreezeReady: this.gold >= SKILL_COST && now - this.skillFreezeLastUse >= SKILL_CD_MS,
      skillNukeReady: this.gold >= SKILL_COST && now - this.skillNukeLastUse >= SKILL_CD_MS,
      skillFreezeCooldown: Math.max(0, SKILL_CD_MS - (now - this.skillFreezeLastUse)),
      skillNukeCooldown: Math.max(0, SKILL_CD_MS - (now - this.skillNukeLastUse)),
      nextWave: this.settings.mode === 'endless'
        ? getWaveForEndless(this.settings.difficulty, this.wave)
        : (this.wave < this.waves.length ? this.waves[this.wave] ?? [] : []),
      totalKills: this.totalKills,
      waveBonuses: this.waveBonuses,
      startTime: this.startTime,
      hasSoldTower: this.hasSoldTower,
    };
  }

  reset(settings?: GameSettings): void {
    if (settings) this.settings = settings;
    sound.setSoundEnabled(this.settings.soundEnabled);
    this.waves = this.settings.mode === 'endless' ? [] : getWavesForDifficulty(this.settings.difficulty);
    const diff = DIFFICULTIES[this.settings.difficulty];
    this.gold = diff.initialGold;
    this.lives = diff.initialLives;
    this.initialLives = diff.initialLives;
    this.wave = 0;
    this.totalKills = 0;
    this.waveBonuses = 0;
    this.startTime = Date.now();
    this.hasSoldTower = false;
    this.lastBonusWave = -1;
    this.newAchievementNames = [];
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
    this.paused = false;
    this.skillFreezeLastUse = 0;
    this.skillNukeLastUse = 0;
    setMap(MAPS[this.settings.mapId]);
    sound.setSoundEnabled(this.settings.soundEnabled);
    this.emitState();
  }

  togglePause(): void {
    if (this.gameOver) return;
    this.paused = !this.paused;
    this.emitState();
  }

  setSpeed(s: number): void {
    this.speed = s;
    this.emitState();
  }

  useSkillFreeze(): boolean {
    if (this.gameOver || this.paused) return false;
    const now = Date.now();
    if (this.gold < SKILL_COST || now - this.skillFreezeLastUse < SKILL_CD_MS) return false;
    this.gold -= SKILL_COST;
    this.skillFreezeLastUse = now;
    for (const e of this.enemies) {
      if (e.alive) e.applySlow(0, SKILL_FREEZE_DURATION);
    }
    this.particles.push(...createFreezeParticles());
    this.emitState();
    return true;
  }

  useSkillNuke(): boolean {
    if (this.gameOver || this.paused) return false;
    const now = Date.now();
    if (this.gold < SKILL_COST || now - this.skillNukeLastUse < SKILL_CD_MS) return false;
    this.gold -= SKILL_COST;
    this.skillNukeLastUse = now;
    for (const e of this.enemies) {
      if (e.alive) {
        e.takeDamage(SKILL_NUKE_DAMAGE);
        if (!e.alive) {
          this.gold += e.claimReward();
          const pos = e.getPosition();
          this.particles.push(...createDeathParticles(pos.x, pos.y, e.color));
          sound.playDeath();
        }
      }
    }
    this.particles.push(...createFreezeParticles());
    this.emitState();
    return true;
  }

  startWave(): void {
    if (this.gameOver) return;
    if (this.waveQueue.length > 0) return;
    this.wave++;
    const isEndless = this.settings.mode === 'endless';
    if (!isEndless && this.wave > this.waves.length) {
      this.gameOver = 'victory';
      sound.playVictory();
      const scores = loadScores();
      scores.victories++;
      scores.bestWave = Math.max(scores.bestWave, this.wave);
      saveScores(scores);
      this.emitState();
      return;
    }
    const waveData = isEndless
      ? getWaveForEndless(this.settings.difficulty, this.wave - 1)
      : (this.waves[this.wave - 1] ?? []);
    this.waveQueue = [...waveData];
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
        const actualDmg = Math.floor(damage * falloff);
        e.takeDamage(actualDmg);
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
    if (this.gameOver || this.paused) return;
    const scaledDt = dt * this.speed;

    if (this.waveQueue.length > 0) {
      this.spawnTimer += scaledDt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        const type = this.waveQueue.shift()!;
        this.enemies.push(
          new Enemy(
            type,
            this.enemyId++,
            this.diff.enemyHpMultiplier,
            this.diff.enemyRewardMultiplier
          )
        );
      }
    }

    for (const e of this.enemies) {
      const result = e.update(scaledDt);
      if (result === 'reached_end') {
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver = 'defeat';
          sound.playDefeat();
          const scores = loadScores();
          scores.bestWave = Math.max(scores.bestWave, this.wave);
          saveScores(scores);
        }
      } else {
        const reward = e.claimReward();
        if (reward > 0) {
          this.totalKills++;
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
      t.updateFlash(dt);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const onSplash =
        p.splashRadius > 0
          ? (x: number, y: number, dmg: number, r: number) =>
              this.applySplashDamage(x, y, dmg, r)
          : undefined;
      if (p.update(scaledDt, onSplash)) {
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
    if (this.playing && this.waveQueue.length === 0 && this.enemies.every((e) => !e.alive)) {
      const isEndless = this.settings.mode === 'endless';
      if (!isEndless && this.wave >= this.waves.length) {
        this.gameOver = 'victory';
        sound.playVictory();
        const scores = loadScores();
        scores.victories++;
        scores.bestWave = Math.max(scores.bestWave, this.wave);
        saveScores(scores);
        this.checkAchievements();
      } else if (this.lastBonusWave < this.wave) {
        this.lastBonusWave = this.wave;
        this.gold += WAVE_BONUS;
        this.waveBonuses += WAVE_BONUS;
      }
    }

    this.emitState();
  }

  tryPlaceTower(typeKey: TowerTypeKey, cellX: number, cellY: number): boolean {
    const map = MAPS[this.settings.mapId];
    const allowed = map?.allowedTowers ?? ['arrow', 'cannon', 'slow', 'mage'];
    if (!allowed.includes(typeKey)) return false;
    const cell = screenToCell(cellX, cellY);
    if (!cell || !canPlaceTower(cell.col, cell.row)) return false;
    const cost = getTowerCost(typeKey, 1);
    if (this.gold < cost) return false;
    const occupied = this.towers.some(
      (t) => Math.floor(t.x / 60) === cell.col && Math.floor(t.y / 60) === cell.row
    );
    if (occupied) return false;
    const { x, y } = cellCenter(cell.col, cell.row);
    this.towers.push(new Tower(typeKey, x, y, this.towerId++));
    this.gold -= cost;
    this.emitState();
    return true;
  }

  tryUpgradeTower(cellX: number, cellY: number): boolean {
    const cell = screenToCell(cellX, cellY);
    if (!cell) return false;
    const tower = this.towers.find(
      (t) => Math.floor(t.x / 60) === cell!.col && Math.floor(t.y / 60) === cell!.row
    );
    if (!tower || tower.level >= 3) return false;
    const cost = tower.upgradeCost;
    if (this.gold < cost) return false;
    this.gold -= cost;
    const cfg = TOWER_TYPES[tower.type];
    const nextLevel = tower.level + 1;
    const l2 = cfg.level2;
    const l3 = cfg.level3;
    if (nextLevel === 2 && l2) {
      tower.level = 2;
      tower.damage = l2.damage ?? tower.damage;
      tower.range = l2.range ?? tower.range;
      tower.cooldownMs = l2.cooldown ?? tower.cooldownMs;
      if ('effectDuration' in l2) tower.effectDuration = l2.effectDuration;
      if ('effectValue' in l2) tower.effectValue = l2.effectValue;
    } else if (nextLevel === 3 && l3) {
      tower.level = 3;
      tower.damage = l3.damage ?? tower.damage;
      tower.range = l3.range ?? tower.range;
      tower.cooldownMs = l3.cooldown ?? tower.cooldownMs;
      if ('effectDuration' in l3) tower.effectDuration = l3.effectDuration;
      if ('effectValue' in l3) tower.effectValue = l3.effectValue;
    }
    this.emitState();
    return true;
  }

  trySellTower(cellX: number, cellY: number): boolean {
    const cell = screenToCell(cellX, cellY);
    if (!cell) return false;
    const idx = this.towers.findIndex(
      (t) => Math.floor(t.x / 60) === cell!.col && Math.floor(t.y / 60) === cell!.row
    );
    if (idx < 0) return false;
    this.hasSoldTower = true;
    const refund = this.towers[idx].sellValue;
    this.towers.splice(idx, 1);
    this.gold += refund;
    this.emitState();
    return true;
  }

  newAchievementNames: string[] = [];

  private checkAchievements(): void {
    const scores = loadScores();
    const unlocked = loadAchievements();
    const before = new Set(unlocked);
    if (scores.victories >= 1 && !unlocked.has('first_win')) unlocked.add('first_win');
    if (scores.victories >= 5 && !unlocked.has('five_wins')) unlocked.add('five_wins');
    if (this.wave >= 5 && !unlocked.has('wave_5')) unlocked.add('wave_5');
    if (this.lives >= this.initialLives && !unlocked.has('full_lives')) unlocked.add('full_lives');
    if (this.towers.length >= 10 && !unlocked.has('ten_towers')) unlocked.add('ten_towers');
    if (!this.hasSoldTower && !unlocked.has('no_sell')) unlocked.add('no_sell');
    saveAchievements(unlocked);
    for (const a of ACHIEVEMENTS) {
      if (unlocked.has(a.id) && !before.has(a.id)) {
        this.newAchievementNames.push(`${a.icon} ${a.name}`);
      }
    }
  }

  getTowerAt(cellX: number, cellY: number): Tower | null {
    const cell = screenToCell(cellX, cellY);
    if (!cell) return null;
    return (
      this.towers.find(
        (t) => Math.floor(t.x / 60) === cell.col && Math.floor(t.y / 60) === cell.row
      ) ?? null
    );
  }

  getAliveEnemies(): Enemy[] {
    return this.enemies.filter((e) => e.alive);
  }
}
