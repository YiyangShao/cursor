import { distance } from './utils';
import { Projectile } from './projectile';
import type { Enemy } from './enemy';

export type TowerTypeKey = 'arrow' | 'cannon' | 'slow' | 'mage';

export interface TowerTypeConfig {
  cost: number;
  damage: number;
  range: number;
  cooldown: number;
  color: string;
  radius: number;
  icon: string;
  effect?: 'slow' | 'splash';
  effectValue?: number;
  effectDuration?: number;
  splashRadius?: number;
}

export const TOWER_TYPES: Record<TowerTypeKey, TowerTypeConfig> = {
  arrow: {
    cost: 100,
    damage: 25,
    range: 120,
    cooldown: 500,
    color: '#2196f3',
    radius: 22,
    icon: '🏹',
  },
  cannon: {
    cost: 200,
    damage: 80,
    range: 150,
    cooldown: 1200,
    color: '#ff9800',
    radius: 24,
    icon: '💣',
    splashRadius: 60,
  },
  slow: {
    cost: 150,
    damage: 15,
    range: 140,
    cooldown: 600,
    color: '#00bcd4',
    radius: 22,
    icon: '❄️',
    effect: 'slow',
    effectValue: 0.4,
    effectDuration: 2000,
  },
  mage: {
    cost: 180,
    damage: 45,
    range: 130,
    cooldown: 800,
    color: '#9c27b0',
    radius: 23,
    icon: '🔮',
  },
};

export class Tower {
  type: TowerTypeKey;
  id: number;
  x: number;
  y: number;
  damage: number;
  range: number;
  cooldownMs: number;
  color: string;
  radius: number;
  icon: string;
  effect?: 'slow' | 'splash';
  effectValue?: number;
  effectDuration?: number;
  splashRadius?: number;
  lastShot: number = 0;

  constructor(typeKey: TowerTypeKey, x: number, y: number, id: number) {
    const config = TOWER_TYPES[typeKey];
    if (!config) throw new Error(`Unknown tower type: ${typeKey}`);
    this.type = typeKey;
    this.id = id;
    this.x = x;
    this.y = y;
    this.damage = config.damage;
    this.range = config.range;
    this.cooldownMs = config.cooldown;
    this.color = config.color;
    this.radius = config.radius;
    this.icon = config.icon;
    this.effect = config.effect;
    this.effectValue = config.effectValue;
    this.effectDuration = config.effectDuration;
    this.splashRadius = config.splashRadius;
  }

  findTarget(enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = this.range;
    for (const e of enemies) {
      if (!e.alive) continue;
      const pos = e.getPosition();
      const d = distance(this.x, this.y, pos.x, pos.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  tryShoot(enemies: Enemy[], now: number): Projectile | null {
    if (now - this.lastShot < this.cooldownMs) return null;
    const target = this.findTarget(enemies);
    if (!target) return null;
    this.lastShot = now;

    const projConfig = {
      damage: this.damage,
      speed: this.type === 'cannon' ? 8 : 12,
      effect: this.effect === 'slow' ? 'slow' as const : undefined,
      effectValue: this.effectValue,
      effectDuration: this.effectDuration,
      splashRadius: this.splashRadius ?? (this.type === 'cannon' ? 60 : 0),
    };

    return new Projectile(this.x, this.y, target, projConfig);
  }
}
