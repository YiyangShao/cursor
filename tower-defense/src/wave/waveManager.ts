import Phaser from 'phaser';
import type { EnemyType } from '../types';

export interface WaveConfig {
  normalCount: number;
  fastCount: number;
  spawnIntervalMs: number;
}

const WAVE_CONFIGS: WaveConfig[] = [
  { normalCount: 3, fastCount: 0, spawnIntervalMs: 1500 },
  { normalCount: 4, fastCount: 1, spawnIntervalMs: 1200 },
  { normalCount: 5, fastCount: 2, spawnIntervalMs: 1000 },
  { normalCount: 6, fastCount: 3, spawnIntervalMs: 900 },
  { normalCount: 7, fastCount: 4, spawnIntervalMs: 800 },
  { normalCount: 8, fastCount: 5, spawnIntervalMs: 700 },
  { normalCount: 9, fastCount: 6, spawnIntervalMs: 650 },
  { normalCount: 10, fastCount: 7, spawnIntervalMs: 600 },
  { normalCount: 12, fastCount: 8, spawnIntervalMs: 550 },
  { normalCount: 15, fastCount: 10, spawnIntervalMs: 500 },
];

const PREPARE_TIME_MS = 4000;
const TOTAL_WAVES = 10;

export class WaveManager {
  private currentWave = 0;
  private spawnQueue: EnemyType[] = [];
  private spawnTimer = 0;
  private isPreparing = true;
  private prepareEndTime = 0;
  private onSpawn: (type: EnemyType) => void;

  constructor(_scene: Phaser.Scene, onSpawn: (type: EnemyType) => void) {
    this.onSpawn = onSpawn;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  isBetweenWaves(): boolean {
    return this.isPreparing;
  }

  getPrepareRemainingMs(now: number): number | null {
    if (!this.isPreparing) return null;
    return Math.max(0, Math.ceil((this.prepareEndTime - now) / 1000) * 1000);
  }

  hasWon(): boolean {
    return this.currentWave >= TOTAL_WAVES && this.spawnQueue.length === 0;
  }

  startNextWave(_time: number): void {
    if (this.currentWave >= TOTAL_WAVES) return;
    this.currentWave += 1;
    const config = WAVE_CONFIGS[this.currentWave - 1] ?? WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
    this.spawnQueue = [
      ...Array(config.normalCount).fill('normal' as EnemyType),
      ...Array(config.fastCount).fill('fast' as EnemyType),
    ];
    this.spawnTimer = 0;
    this.isPreparing = false;
  }

  beginPrepare(time: number): void {
    this.isPreparing = true;
    this.prepareEndTime = time + PREPARE_TIME_MS;
  }

  update(time: number, delta: number): void {
    if (this.isPreparing) {
      if (time >= this.prepareEndTime) {
        this.startNextWave(time);
      }
      return;
    }

    if (this.spawnQueue.length === 0) {
      this.beginPrepare(time);
      return;
    }

    const config = WAVE_CONFIGS[this.currentWave - 1] ?? WAVE_CONFIGS[0];
    this.spawnTimer += delta;
    if (this.spawnTimer >= config.spawnIntervalMs) {
      this.spawnTimer = 0;
      const next = this.spawnQueue.shift();
      if (next) {
        this.onSpawn(next);
      }
    }
  }
}
