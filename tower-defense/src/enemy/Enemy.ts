import Phaser from 'phaser';
import type { EnemyType } from '../types';
import { getPointOnPath } from '../map/map';
import { ENEMY_CONFIGS } from './enemies';
import { showDamageText } from '../effects/DamageText';

const BAR_WIDTH = 24;
const BAR_HEIGHT = 4;
const BAR_OFFSET_Y = -18;

export class Enemy extends Phaser.GameObjects.Container {
  readonly enemyType: EnemyType;
  health: number;
  readonly maxHealth: number;
  readonly speed: number;
  readonly reward: number;
  progress: number; // 0..1 沿路径进度
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFill!: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyType: EnemyType
  ) {
    const config = ENEMY_CONFIGS[enemyType];
    if (!config) {
      throw new Error(`Unknown enemy type: ${enemyType}`);
    }
    super(scene, x, y);

    this.enemyType = enemyType;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.reward = config.reward;
    this.progress = 0;

    const color = enemyType === 'normal' ? 0x4ade80 : 0xfbbf24;
    const radius = enemyType === 'normal' ? 12 : 10;
    const circle = scene.add.circle(0, 0, radius, color);
    this.add(circle);

    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x334155, 0.8);
    this.healthBarBg.fillRect(-BAR_WIDTH / 2, BAR_OFFSET_Y, BAR_WIDTH, BAR_HEIGHT);
    this.add(this.healthBarBg);

    this.healthBarFill = scene.add.graphics();
    this.updateHealthBar();
    this.add(this.healthBarFill);

    scene.add.existing(this);
  }

  private updateHealthBar(): void {
    this.healthBarFill.clear();
    const ratio = Math.max(0, this.health / this.maxHealth);
    const fillColor = ratio > 0.5 ? 0x4ade80 : ratio > 0.25 ? 0xfbbf24 : 0xef4444;
    this.healthBarFill.fillStyle(fillColor, 1);
    this.healthBarFill.fillRect(-BAR_WIDTH / 2, BAR_OFFSET_Y, BAR_WIDTH * ratio, BAR_HEIGHT);
  }

  update(delta: number, now?: number): void {
    let effectiveSpeed = this.speed;
    const slowPercent = this.getData('slowPercent') as number | undefined;
    const slowUntil = this.getData('slowUntil') as number | undefined;
    if (slowPercent != null && slowUntil != null && (now ?? 0) < slowUntil) {
      effectiveSpeed *= 1 - slowPercent;
    }
    this.progress += (effectiveSpeed * delta) / 1000;
    const clamped = Math.min(1, this.progress);
    const pt = getPointOnPath(clamped);
    this.setPosition(pt.x, pt.y);
  }

  applySlow(percent: number, durationMs: number, now: number): void {
    this.setData('slowPercent', percent);
    this.setData('slowUntil', now + durationMs);
  }

  takeDamage(amount: number): void {
    if (amount <= 0) return;
    this.health -= amount;
    showDamageText(this.scene, this.x, this.y, amount);
    this.updateHealthBar();
    if (this.health <= 0) {
      this.destroy();
    }
  }

  reachedEnd(): boolean {
    return this.progress >= 1;
  }
}
