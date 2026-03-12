import { getPathPosition } from './path';

export type EnemyTypeKey = 'goblin' | 'wolf' | 'tank' | 'boss';

export interface EnemyTypeConfig {
  hp: number;
  speed: number;
  reward: number;
  color: string;
  radius: number;
}

export const ENEMY_TYPES: Record<EnemyTypeKey, EnemyTypeConfig> = {
  goblin: {
    hp: 100,
    speed: 0.00015,
    reward: 15,
    color: '#4caf50',
    radius: 14,
  },
  wolf: {
    hp: 60,
    speed: 0.00028,
    reward: 25,
    color: '#9c27b0',
    radius: 12,
  },
  tank: {
    hp: 300,
    speed: 0.00008,
    reward: 40,
    color: '#795548',
    radius: 18,
  },
  boss: {
    hp: 800,
    speed: 0.0001,
    reward: 150,
    color: '#d32f2f',
    radius: 24,
  },
};

export class Enemy {
  type: EnemyTypeKey;
  id: number;
  maxHp: number;
  hp: number;
  baseSpeed: number;
  speed: number;
  reward: number;
  color: string;
  radius: number;
  progress: number;
  alive: boolean;
  rewarded: boolean;

  constructor(typeKey: EnemyTypeKey, id: number) {
    const config = ENEMY_TYPES[typeKey];
    if (!config) throw new Error(`Unknown enemy type: ${typeKey}`);
    this.type = typeKey;
    this.id = id;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.baseSpeed = config.speed;
    this.speed = config.speed;
    this.reward = config.reward;
    this.color = config.color;
    this.radius = config.radius;
    this.progress = 0;
    this.alive = true;
    this.rewarded = false;
  }

  applySlow(factor: number, durationMs: number): void {
    this.speed = this.baseSpeed * factor;
    this.slowUntil = Date.now() + durationMs;
  }

  slowUntil: number = 0;

  update(dt: number): boolean | 'reached_end' {
    if (!this.alive) return false;
    if (Date.now() > this.slowUntil) {
      this.speed = this.baseSpeed;
    }
    this.progress += this.speed * dt;
    if (this.progress >= 1) {
      this.alive = false;
      return 'reached_end';
    }
    return true;
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  claimReward(): number {
    if (this.alive || this.rewarded) return 0;
    this.rewarded = true;
    return this.reward;
  }

  getPosition() {
    return getPathPosition(this.progress);
  }
}
