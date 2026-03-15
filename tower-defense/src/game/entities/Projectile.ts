import Phaser from 'phaser';
import type Enemy from './Enemy';

export default class Projectile extends Phaser.GameObjects.Arc {
  private target: Enemy | null = null;
  private speed: number;
  private damage: number;
  private onHit: (target: Enemy, damage: number) => void;
  private hit = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: { speed: number; damage: number },
    onHit: (target: Enemy, damage: number) => void,
  ) {
    super(scene, x, y, 6, 0, 360, false, 0xffdd44, 1);
    this.speed = config.speed;
    this.damage = config.damage;
    this.onHit = onHit;
  }

  setTarget(target: Enemy): void {
    this.target = target;
  }

  flyUpdate(_time: number, delta: number): void {
    if (!this.target || this.hit) return;
    const enemy = this.target as unknown as Phaser.GameObjects.GameObject;
    if (!enemy.active) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveDist = (this.speed * delta) / 1000;

    if (dist <= moveDist) {
      this.hit = true;
      this.onHit(this.target, this.damage);
      this.destroy();
      return;
    }

    this.x += (dx / dist) * moveDist;
    this.y += (dy / dist) * moveDist;
  }
}
