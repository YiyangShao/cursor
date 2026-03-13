import { getPathPosition } from './path';

export type EnemyTypeKey = 'goblin' | 'wolf' | 'tank' | 'boss';

export interface EnemyTypeConfig {
  hp: number;
  speed: number;
  reward: number;
  color: string;
  radius: number;
  /** 可爱风格外观：emoji 或绘制用标识 */
  sprite: string;
}

export const ENEMY_LABELS: Record<EnemyTypeKey, string> = {
  goblin: '小猫咪',
  wolf: '小松鼠',
  tank: '小狗狗',
  boss: '大熊猫',
};

export const ENEMY_TYPES: Record<EnemyTypeKey, EnemyTypeConfig> = {
  goblin: {
    hp: 100,
    speed: 0.00015,
    reward: 15,
    color: '#ffb74d',
    radius: 14,
    sprite: '🐱',
  },
  wolf: {
    hp: 60,
    speed: 0.00028,
    reward: 25,
    color: '#8d6e63',
    radius: 12,
    sprite: '🐿️',
  },
  tank: {
    hp: 300,
    speed: 0.00008,
    reward: 40,
    color: '#ffb74d',
    radius: 18,
    sprite: '🐕',
  },
  boss: {
    hp: 800,
    speed: 0.0001,
    reward: 150,
    color: '#546e7a',
    radius: 24,
    sprite: '🐼',
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
  sprite: string;
  progress: number;
  alive: boolean;
  rewarded: boolean;

  constructor(typeKey: EnemyTypeKey, id: number, hpMult = 1, rewardMult = 1) {
    const config = ENEMY_TYPES[typeKey];
    if (!config) throw new Error(`Unknown enemy type: ${typeKey}`);
    this.type = typeKey;
    this.id = id;
    this.maxHp = Math.floor(config.hp * hpMult);
    this.hp = this.maxHp;
    this.baseSpeed = config.speed;
    this.speed = config.speed;
    this.reward = Math.floor(config.reward * rewardMult);
    this.color = config.color;
    this.radius = config.radius;
    this.sprite = config.sprite;
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
