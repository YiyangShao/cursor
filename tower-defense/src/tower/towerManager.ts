import Phaser from 'phaser';
import type { TowerType } from '../types';
import { canPlaceTower } from '../map/map';
import { Tower } from './Tower';
import { TOWER_CONFIGS, UPGRADE_COST } from './towers';
import { Enemy } from '../enemy/Enemy';

export class TowerManager {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Group;
  private towerMap = new Map<string, Tower>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.group = scene.add.group();
  }

  getTowers(): Tower[] {
    return this.group.getMatching('active', true).filter((o): o is Tower => o instanceof Tower);
  }

  canPlace(col: number, row: number): boolean {
    return canPlaceTower(col, row) && !this.towerMap.has(`${col},${row}`);
  }

  place(col: number, row: number, towerType: TowerType): Tower | null {
    if (!this.canPlace(col, row)) return null;
    const tower = new Tower(this.scene, col, row, towerType);
    this.group.add(tower);
    this.towerMap.set(`${col},${row}`, tower);
    return tower;
  }

  getTowerAt(col: number, row: number): Tower | undefined {
    return this.towerMap.get(`${col},${row}`);
  }

  upgrade(tower: Tower): boolean {
    if (tower.level >= 2) return false;
    tower.level = 2;
    return true;
  }

  sell(tower: Tower): number {
    const key = `${tower.col},${tower.row}`;
    const baseCost = TOWER_CONFIGS[tower.towerType]?.cost ?? 0;
    const refund = tower.level === 2
      ? Math.floor((baseCost + UPGRADE_COST) * 0.5)
      : Math.floor(baseCost * 0.5);
    this.towerMap.delete(key);
    tower.destroy();
    return refund;
  }

  getUpgradeCost(): number {
    return UPGRADE_COST;
  }

  getTowerCost(towerType: TowerType): number {
    return TOWER_CONFIGS[towerType]?.cost ?? 0;
  }

  updateTowers(time: number, enemies: Enemy[]): void {
    for (const tower of this.getTowers()) {
      tower.tryFire(time, enemies);
    }
  }
}
