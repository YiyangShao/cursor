import Phaser from 'phaser';
import type { EnemyType } from '../types';
import { getPathWorldPoints } from '../map/map';
import { Enemy } from './Enemy';

export class EnemyManager {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Group;
  private onReachedEnd: (enemy: Enemy) => void;
  private onKilled: (enemy: Enemy) => void;

  constructor(
    scene: Phaser.Scene,
    onReachedEnd: (enemy: Enemy) => void,
    onKilled: (enemy: Enemy) => void
  ) {
    this.scene = scene;
    this.onReachedEnd = onReachedEnd;
    this.onKilled = onKilled;
    this.group = scene.add.group();
  }

  spawn(enemyType: EnemyType): Enemy {
    const points = getPathWorldPoints();
    if (points.length === 0) {
      throw new Error('Cannot spawn enemy: path is empty');
    }
    const start = points[0];
    const enemy = new Enemy(this.scene, start.x, start.y, enemyType);
    this.group.add(enemy);

    enemy.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.onKilled(enemy);
    });

    return enemy;
  }

  getAliveEnemies(): Enemy[] {
    return this.group.getMatching('active', true).filter((o): o is Enemy => o instanceof Enemy);
  }

  update(delta: number, now: number): void {
    const enemies = this.getAliveEnemies();
    for (const enemy of enemies) {
      enemy.update(delta, now);
      if (enemy.reachedEnd()) {
        this.onReachedEnd(enemy);
        enemy.destroy();
      }
    }
  }
}
