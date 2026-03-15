import type { EnemyType } from '../types';

export interface EnemyConfig {
  type: EnemyType;
  health: number;
  speed: number; // 格/秒，即 path progress 每秒增加量
  reward: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  normal: {
    type: 'normal',
    health: 100,
    speed: 0.25,
    reward: 10,
  },
  fast: {
    type: 'fast',
    health: 60,
    speed: 0.4,
    reward: 15,
  },
};
