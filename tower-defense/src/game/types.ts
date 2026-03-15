export interface WaveDef {
  enemyId: string;
  count: number;
  spawnInterval: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  tiledMapKey: string;
  initialGold: number;
  initialLives: number;
  waves: WaveDef[];
}

export interface TowerUpgradeDef {
  towerId: string;
  level: number;
  nextLevel?: number;
  goldCost: number;
  damage?: number;
  range?: number;
  attackSpeed?: number;
}
