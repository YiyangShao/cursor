import { distance } from './utils';
import { Projectile } from './projectile';
import type { Enemy } from './enemy';

export type TowerTypeKey = 'arrow' | 'cannon' | 'slow' | 'mage';

export interface TowerLevelStats {
  damage: number;
  range: number;
  cooldown: number;
  cost: number;
  sellValue: number;
  effectDuration?: number;
  effectValue?: number;
}

export interface TowerTypeConfig {
  base: TowerLevelStats;
  level2?: Partial<TowerLevelStats> & { cost: number };
  level3?: Partial<TowerLevelStats> & { cost: number };
  color: string;
  radius: number;
  icon: string;
  /** 1-3级外观：越来越霸气 */
  iconL1: string;
  iconL2: string;
  iconL3: string;
  effect?: 'slow' | 'splash';
  effectValue?: number;
  effectDuration?: number;
  splashRadius?: number;
}

const arrowBase: TowerLevelStats = {
  damage: 25, range: 120, cooldown: 500, cost: 100, sellValue: 50,
};
const cannonBase: TowerLevelStats = {
  damage: 80, range: 150, cooldown: 1200, cost: 200, sellValue: 100,
};
const slowBase: TowerLevelStats = {
  damage: 15, range: 140, cooldown: 600, cost: 150, sellValue: 75,
};
const mageBase: TowerLevelStats = {
  damage: 45, range: 130, cooldown: 800, cost: 180, sellValue: 90,
};

export const TOWER_TYPES: Record<TowerTypeKey, TowerTypeConfig> = {
  arrow: {
    base: arrowBase,
    level2: { damage: 45, range: 135, cooldown: 400, cost: 80, sellValue: 120 },
    level3: { damage: 70, range: 150, cooldown: 300, cost: 120, sellValue: 180 },
    color: '#2196f3',
    radius: 22,
    icon: '🏹',
    iconL1: '🏹',
    iconL2: '🎯',
    iconL3: '⚔️',
  },
  cannon: {
    base: cannonBase,
    level2: { damage: 120, range: 165, cooldown: 1000, cost: 150, sellValue: 220 },
    level3: { damage: 180, range: 180, cooldown: 800, cost: 200, sellValue: 350 },
    color: '#ff9800',
    radius: 24,
    icon: '💣',
    iconL1: '💣',
    iconL2: '🔥',
    iconL3: '💥',
    splashRadius: 60,
  },
  slow: {
    base: slowBase,
    level2: { damage: 25, range: 155, cost: 100, sellValue: 150, effectDuration: 2500 },
    level3: { damage: 40, range: 170, cost: 130, sellValue: 220, effectDuration: 3000, effectValue: 0.3 },
    color: '#00bcd4',
    radius: 22,
    icon: '❄️',
    iconL1: '❄️',
    iconL2: '🧊',
    iconL3: '🌨️',
    effect: 'slow',
    effectValue: 0.4,
    effectDuration: 2000,
  },
  mage: {
    base: mageBase,
    level2: { damage: 75, range: 145, cooldown: 650, cost: 140, sellValue: 200 },
    level3: { damage: 120, range: 160, cooldown: 500, cost: 180, sellValue: 320 },
    color: '#9c27b0',
    radius: 23,
    icon: '🔮',
    iconL1: '🔮',
    iconL2: '✨',
    iconL3: '🌟',
  },
};

function getStatsAtLevel(type: TowerTypeKey, level: number): { damage: number; range: number; cooldown: number; cost: number; sellValue: number } {
  const cfg = TOWER_TYPES[type];
  if (level === 1) return cfg.base;
  const merged = level === 2 && cfg.level2
    ? { ...cfg.base, ...cfg.level2 }
    : level === 3 && cfg.level3
      ? { ...cfg.base, ...cfg.level2, ...cfg.level3 }
      : cfg.base;
  return merged;
}

export function getTowerCost(type: TowerTypeKey, level: number): number {
  return getStatsAtLevel(type, level).cost;
}

export function getTowerSellValue(type: TowerTypeKey, level: number): number {
  return getStatsAtLevel(type, level).sellValue;
}

export function getTowerIconAtLevel(type: TowerTypeKey, level: number): string {
  const cfg = TOWER_TYPES[type];
  if (!cfg) return '?';
  return level === 1 ? cfg.iconL1 : level === 2 ? cfg.iconL2 : cfg.iconL3;
}

export class Tower {
  type: TowerTypeKey;
  id: number;
  x: number;
  y: number;
  level: number;
  damage: number;
  range: number;
  cooldownMs: number;
  color: string;
  radius: number;
  icon: string;
  iconL1: string;
  iconL2: string;
  iconL3: string;
  effect?: 'slow' | 'splash';
  effectValue?: number;
  effectDuration?: number;
  splashRadius?: number;
  lastShot: number = 0;
  aimAngle: number = 0;
  shootFlash: number = 0;

  constructor(typeKey: TowerTypeKey, x: number, y: number, id: number, level = 1) {
    const cfg = TOWER_TYPES[typeKey];
    if (!cfg) throw new Error(`Unknown tower type: ${typeKey}`);
    const stats = getStatsAtLevel(typeKey, level);
    this.type = typeKey;
    this.id = id;
    this.x = x;
    this.y = y;
    this.level = level;
    this.damage = stats.damage;
    this.range = stats.range;
    this.cooldownMs = stats.cooldown;
    this.color = cfg.color;
    this.radius = cfg.radius;
    this.icon = cfg.icon;
    this.iconL1 = cfg.iconL1;
    this.iconL2 = cfg.iconL2;
    this.iconL3 = cfg.iconL3;
    this.effect = cfg.effect;
    this.effectValue = cfg.effectValue;
    this.effectDuration = cfg.effectDuration;
    this.splashRadius = cfg.splashRadius ?? (typeKey === 'cannon' ? 60 : 0);
  }

  get upgradeCost(): number {
    const cfg = TOWER_TYPES[this.type];
    if (this.level >= 3) return Infinity;
    return cfg.level2 && this.level === 1 ? cfg.level2.cost
      : cfg.level3 && this.level === 2 ? cfg.level3!.cost
        : Infinity;
  }

  get sellValue(): number {
    return getTowerSellValue(this.type, this.level);
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
    const pos = target.getPosition();
    this.aimAngle = Math.atan2(pos.y - this.y, pos.x - this.x);
    this.shootFlash = 1;

    const projConfig = {
      damage: this.damage,
      speed: this.type === 'cannon' ? 8 : 12,
      effect: this.effect === 'slow' ? 'slow' as const : undefined,
      effectValue: this.effectValue,
      effectDuration: this.effectDuration,
      splashRadius: this.splashRadius ?? 0,
    };

    return new Projectile(this.x, this.y, target, projConfig);
  }

  updateFlash(dt: number): void {
    if (this.shootFlash > 0) {
      this.shootFlash = Math.max(0, this.shootFlash - dt / 80);
    }
  }
}
