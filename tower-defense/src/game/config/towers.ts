export interface TowerLevelDef {
  damage: number;
  range: number;
  attackInterval: number;
  cost: number;
  displayName: string;
}

export type TowerId = 'cupcake';

export const TOWER_UPGRADES: Record<TowerId, Record<number, TowerLevelDef>> = {
  cupcake: {
    1: {
      damage: 15,
      range: 150,
      attackInterval: 800,
      cost: 50,
      displayName: '杯子蛋糕',
    },
    2: {
      damage: 25,
      range: 160,
      attackInterval: 700,
      cost: 80,
      displayName: '杯子蛋糕+',
    },
    3: {
      damage: 40,
      range: 170,
      attackInterval: 600,
      cost: 120,
      displayName: '杯子蛋糕++',
    },
  },
};

export const MAX_TOWER_LEVEL = 3;

export const TOWER_SELL_RATIO = 0.5;

export function getTowerDef(id: TowerId, level: number): TowerLevelDef | undefined {
  return TOWER_UPGRADES[id]?.[level];
}

export function getBuildableTowers(): Array<{ id: TowerId; def: TowerLevelDef }> {
  return [{ id: 'cupcake', def: TOWER_UPGRADES.cupcake[1] }];
}

export function getTowerTotalCost(id: TowerId, level: number): number {
  let total = 0;
  for (let l = 1; l <= level; l++) {
    const def = getTowerDef(id, l);
    if (def) total += def.cost;
  }
  return total;
}
