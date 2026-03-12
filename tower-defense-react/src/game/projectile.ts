import type { Enemy } from './enemy';

export type ProjectileEffect = 'none' | 'slow' | 'splash';

export interface ProjectileConfig {
  damage: number;
  speed: number;
  effect?: ProjectileEffect;
  effectValue?: number;
  effectDuration?: number;
  splashRadius?: number;
}

export class Projectile {
  x: number;
  y: number;
  target: Enemy | null;
  damage: number;
  speed: number;
  hit: boolean;
  effect: ProjectileEffect;
  effectValue: number;
  effectDuration: number;
  splashRadius: number;

  constructor(
    x: number,
    y: number,
    target: Enemy,
    config: ProjectileConfig
  ) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = config.damage;
    this.speed = config.speed;
    this.hit = false;
    this.effect = config.effect ?? 'none';
    this.effectValue = config.effectValue ?? 0;
    this.effectDuration = config.effectDuration ?? 0;
    this.splashRadius = config.splashRadius ?? 0;
  }

  update(
    dt: number,
    onSplash?: (x: number, y: number, damage: number, radius: number) => void
  ): boolean {
    if (this.hit || !this.target?.alive) return true;
    const pos = this.target.getPosition();
    const dx = pos.x - this.x;
    const dy = pos.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < this.target.radius + 5) {
      if (this.splashRadius > 0 && onSplash) {
        onSplash(this.x, this.y, this.damage, this.splashRadius);
      } else {
        this.target.takeDamage(this.damage);
        if (this.effect === 'slow' && this.effectValue && this.effectDuration) {
          this.target.applySlow(this.effectValue, this.effectDuration);
        }
      }
      this.hit = true;
      return true;
    }
    const move = Math.min(this.speed * dt, dist);
    this.x += (dx / dist) * move;
    this.y += (dy / dist) * move;
    return false;
  }
}
