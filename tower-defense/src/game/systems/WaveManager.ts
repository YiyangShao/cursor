import Phaser from 'phaser';
import type { LevelConfig, WaveDef } from '../types';
import Enemy from '../entities/Enemy';

const ENEMY_CONFIGS: Record<
  string,
  { hp: number; reward: number; damageToBase: number; speed?: number }
> = {
  mouse: { hp: 30, reward: 10, damageToBase: 1, speed: 90 },
};

export default class WaveManager {
  private scene: Phaser.Scene;
  private config: LevelConfig;
  private path: Phaser.Curves.Path;
  private enemyGroup: Phaser.GameObjects.Group;
  private currentWaveIndex = 0;
  private spawnCount = 0;
  private waveInProgress = false;
  private onCreateEnemy: (enemy: Enemy) => void;
  private onReachedEnd: () => void;
  private onKilled: (enemy: Enemy) => void;
  private enemyTexture: string;

  constructor(
    scene: Phaser.Scene,
    config: LevelConfig,
    path: Phaser.Curves.Path,
    enemyTexture: string,
    callbacks: {
      onCreateEnemy: (enemy: Enemy) => void;
      onReachedEnd: () => void;
      onKilled: (enemy: Enemy) => void;
    },
  ) {
    this.scene = scene;
    this.config = config;
    this.path = path;
    this.enemyTexture = enemyTexture;
    this.onCreateEnemy = callbacks.onCreateEnemy;
    this.onReachedEnd = callbacks.onReachedEnd;
    this.onKilled = callbacks.onKilled;

    this.enemyGroup = scene.add.group();
  }

  get enemyCount(): number {
    return this.enemyGroup.getLength();
  }

  getEnemies(): Phaser.GameObjects.GameObject[] {
    return this.enemyGroup.getChildren();
  }

  startNextWave(): boolean {
    if (this.currentWaveIndex >= this.config.waves.length) {
      return false;
    }
    this.waveInProgress = true;
    const wave = this.config.waves[this.currentWaveIndex];
    this.spawnCount = 0;
    this.scheduleNextSpawn(wave);
    return true;
  }

  private scheduleNextSpawn(wave: WaveDef): void {
    if (this.spawnCount >= wave.count) {
      this.currentWaveIndex++;
      this.waveInProgress = false;
      return;
    }

    this.spawnEnemy(wave.enemyId);
    this.spawnCount++;

    if (this.spawnCount < wave.count) {
      this.scene.time.delayedCall(wave.spawnInterval, () => {
        this.scheduleNextSpawn(wave);
      });
    } else {
      this.currentWaveIndex++;
      this.waveInProgress = false;
    }
  }

  private spawnEnemy(enemyId: string): void {
    const cfg = ENEMY_CONFIGS[enemyId] ?? {
      hp: 30,
      reward: 10,
      damageToBase: 1,
      speed: 80,
    };
    const start = this.path.getStartPoint();
    const enemy = new Enemy(
      this.scene,
      this.path,
      start.x,
      start.y,
      this.enemyTexture,
      {
        enemyId,
        hp: cfg.hp,
        reward: cfg.reward,
        damageToBase: cfg.damageToBase,
        speed: cfg.speed,
        onReachedEnd: () => this.onReachedEnd(),
        onKilled: (e) => this.onKilled(e),
      },
    );
    enemy.setData('enemy', enemy);
    this.enemyGroup.add(enemy as unknown as Phaser.GameObjects.GameObject);
    this.scene.add.existing(enemy);
    this.onCreateEnemy(enemy);
  }

  hasMoreWaves(): boolean {
    return this.currentWaveIndex < this.config.waves.length;
  }

  isWaveInProgress(): boolean {
    return this.waveInProgress;
  }

  allEnemiesCleared(): boolean {
    return !this.waveInProgress && this.enemyCount === 0;
  }

  checkVictory(): boolean {
    return (
      !this.hasMoreWaves() &&
      this.allEnemiesCleared()
    );
  }
}
