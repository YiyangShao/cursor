import Phaser from 'phaser';
import type { TowerType } from '../types';
import {
  TOWER_CONFIGS,
  UPGRADE_MULTIPLIER,
  type TowerConfig,
} from './towers';
import { Enemy } from '../enemy/Enemy';
import { gridToWorld } from '../map/map';
import { showAttackLine, showSplashEffect } from '../effects/TowerEffects';

export class Tower extends Phaser.GameObjects.Container {
  readonly towerType: TowerType;
  level: number;
  private config: TowerConfig;
  private lastFireTime = 0;
  private _col: number;
  private _row: number;

  constructor(
    scene: Phaser.Scene,
    col: number,
    row: number,
    towerType: TowerType
  ) {
    const config = TOWER_CONFIGS[towerType];
    if (!config) {
      throw new Error(`Unknown tower type: ${towerType}`);
    }
    const { x, y } = gridToWorld(col, row);
    super(scene, x, y);

    this.towerType = towerType;
    this._col = col;
    this._row = row;
    this.level = 1;
    this.config = { ...config };

    const color = towerType === 'cannon' ? 0x3b82f6 : towerType === 'slow' ? 0x8b5cf6 : 0xf59e0b;
    const radius = 16;
    const circle = scene.add.circle(0, 0, radius, color);
    this.add(circle);

    scene.add.existing(this);
  }

  get col(): number {
    return this._col;
  }

  get row(): number {
    return this._row;
  }

  get damage(): number {
    const base = this.config.damage;
    return this.level === 2 ? Math.floor(base * UPGRADE_MULTIPLIER) : base;
  }

  get range(): number {
    const base = this.config.range;
    return this.level === 2 ? Math.floor(base * UPGRADE_MULTIPLIER) : base;
  }

  get fireRateMs(): number {
    return this.config.fireRate;
  }

  get slowPercent(): number | undefined {
    return this.config.slowPercent;
  }

  get splashRadius(): number | undefined {
    return this.config.splashRadius;
  }

  /** 找射程内最近的敌人（按路径进度优先，即最接近终点的） */
  findTarget(enemies: Enemy[]): Enemy | null {
    const inRange = enemies.filter((e) => {
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      return d <= this.range && !e.reachedEnd();
    });
    if (inRange.length === 0) return null;
    inRange.sort((a, b) => b.progress - a.progress);
    return inRange[0];
  }

  /** 溅射塔：找范围内所有敌人（以 splashRadius 为射程） */
  findTargetsInSplash(enemies: Enemy[]): Enemy[] {
    const r = this.splashRadius ?? this.range;
    return enemies.filter((e) => {
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      return d <= r && !e.reachedEnd();
    });
  }

  /** 炮塔/减速塔：找范围内最近的 */
  findTargetInRange(enemies: Enemy[]): Enemy | null {
    return this.findTarget(enemies);
  }

  tryFire(time: number, enemies: Enemy[]): boolean {
    if (this.config.splashRadius !== undefined) {
      return this.tryFireSplash(time, enemies);
    }
    return this.tryFireSingle(time, enemies);
  }

  private tryFireSingle(time: number, enemies: Enemy[]): boolean {
    const target = this.findTargetInRange(enemies);
    if (!target) return false;
    if (time - this.lastFireTime < this.fireRateMs) return false;

    this.lastFireTime = time;
    showAttackLine(this.scene, this.x, this.y, target.x, target.y);
    target.takeDamage(this.damage);
    if (this.slowPercent !== undefined) {
      target.applySlow(this.slowPercent, 800, time);
    }
    return true;
  }

  private tryFireSplash(time: number, enemies: Enemy[]): boolean {
    const targets = this.findTargetsInSplash(enemies);
    if (targets.length === 0) return false;
    if (time - this.lastFireTime < this.fireRateMs) return false;

    this.lastFireTime = time;
    const centerX = targets.reduce((s, t) => s + t.x, 0) / targets.length;
    const centerY = targets.reduce((s, t) => s + t.y, 0) / targets.length;
    showSplashEffect(this.scene, centerX, centerY, this.splashRadius ?? 60);
    for (const t of targets) {
      t.takeDamage(this.damage);
    }
    return true;
  }
}
