import Phaser from 'phaser';
import type Enemy from './Enemy';
import type { TowerUpgradeDef } from '../types';
import {
  getTowerDef,
  MAX_TOWER_LEVEL,
  type TowerId,
} from '../config/towers';

export interface TowerConfig {
  id: string;
  level?: number;
  damage: number;
  range: number;
  attackInterval: number;
  cost: number;
}

export default class Tower extends Phaser.GameObjects.Sprite {
  public readonly towerId: TowerId;
  public level: number;
  private _damage: number;
  private _range: number;
  private _attackInterval: number;
  public readonly cost: number;
  private lastAttackTime = 0;
  private enemies: Phaser.GameObjects.GameObject[] = [];
  private rangeGraphics: Phaser.GameObjects.Graphics | null = null;
  private onAttack: (tower: Tower, target: Enemy) => void;

  get damage(): number {
    return this._damage;
  }
  get range(): number {
    return this._range;
  }
  get attackInterval(): number {
    return this._attackInterval;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: TowerConfig,
    onAttack: (tower: Tower, target: Enemy) => void,
  ) {
    super(scene, x, y, texture);
    this.towerId = config.id as TowerId;
    this.level = config.level ?? 1;
    this._damage = config.damage;
    this._range = config.range;
    this._attackInterval = config.attackInterval;
    this.cost = config.cost;
    this.onAttack = onAttack;

    this.setOrigin(0.5, 0.5);
    this.setInteractive({ useHandCursor: true });
    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.emit('tower-selected', this);
    });
  }

  setEnemyGroup(_group: Phaser.GameObjects.Group): void {
    // No-op, we use updateEnemies
  }

  updateEnemies(enemies: Phaser.GameObjects.GameObject[]): void {
    this.enemies = enemies;
  }

  update(time: number): void {
    if (time - this.lastAttackTime < this._attackInterval) return;

    const target = this.findClosestEnemy();
    if (target) {
      this.lastAttackTime = time;
      const enemy = target as unknown as Enemy;
      if (enemy?.isAlive?.()) {
        this.onAttack(this, enemy);
      }
    }
  }

  private findClosestEnemy(): Phaser.GameObjects.GameObject | null {
    let closest: Phaser.GameObjects.GameObject | null = null;
    let closestDist = this._range;

    for (const obj of this.enemies) {
      const enemy = obj as unknown as Enemy;
      if (!enemy?.isAlive?.()) continue;

      const o = obj as unknown as { x: number; y: number };
      const dx = o.x - this.x;
      const dy = o.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= this._range && dist < closestDist) {
        closestDist = dist;
        closest = obj;
      }
    }
    return closest;
  }

  showRange(show: boolean): void {
    if (show && !this.rangeGraphics) {
      this.rangeGraphics = this.scene.add.graphics();
      this.rangeGraphics.lineStyle(2, 0x88cc44, 0.5);
      this.rangeGraphics.strokeCircle(this.x, this.y, this._range);
      this.rangeGraphics.setDepth(-1);
    }
    if (this.rangeGraphics) {
      this.rangeGraphics.setVisible(show);
      if (show) {
        this.rangeGraphics.clear();
        this.rangeGraphics.lineStyle(2, 0x88cc44, 0.5);
        this.rangeGraphics.strokeCircle(this.x, this.y, this._range);
      }
    }
  }

  destroy(fromScene?: boolean): void {
    this.rangeGraphics?.destroy();
    super.destroy(fromScene);
  }

  getUpgradeDef(): TowerUpgradeDef | null {
    if (this.level >= MAX_TOWER_LEVEL) return null;
    const nextDef = getTowerDef(this.towerId, this.level + 1);
    if (!nextDef) return null;
    return {
      towerId: this.towerId,
      level: this.level + 1,
      goldCost: nextDef.cost,
      damage: nextDef.damage,
      range: nextDef.range,
    };
  }

  canUpgrade(getGold: () => number): boolean {
    const def = this.getUpgradeDef();
    if (!def) return false;
    return getGold() >= def.goldCost;
  }

  upgrade(def: TowerUpgradeDef): void {
    const nextDef = getTowerDef(this.towerId, def.level);
    if (!nextDef || def.level <= this.level) return;

    this.level = def.level;
    this._damage = nextDef.damage;
    this._range = nextDef.range;
    this._attackInterval = nextDef.attackInterval;
    this.emit('tower-upgraded', this);
  }
}
