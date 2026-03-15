import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.PathFollower {
  declare body: Phaser.Physics.Arcade.Body;

  public readonly enemyId: string;
  public hp: number;
  public readonly reward: number;
  public readonly damageToBase: number;
  private onReachedEnd: () => void;
  private onKilled: (enemy: Enemy) => void;
  private isDead = false;

  constructor(
    scene: Phaser.Scene,
    path: Phaser.Curves.Path,
    x: number,
    y: number,
    texture: string,
    config: {
      enemyId: string;
      hp: number;
      reward: number;
      damageToBase: number;
      onReachedEnd: () => void;
      onKilled: (enemy: Enemy) => void;
      speed?: number;
    },
  ) {
    super(scene, path, x, y, texture);
    this.enemyId = config.enemyId;
    this.hp = config.hp;
    this.reward = config.reward;
    this.damageToBase = config.damageToBase;
    this.onReachedEnd = config.onReachedEnd;
    this.onKilled = config.onKilled;

    this.setScale(0.5);
    const speed = config.speed ?? 80;
    this.startFollow({
      duration: (path.getLength() / speed) * 1000,
      from: 0,
      to: 1,
      onComplete: () => this.handleReachedEnd(),
    });
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isDead = true;
      this.stopFollow();
      this.onKilled(this);
      this.destroy();
    }
  }

  private handleReachedEnd(): void {
    if (this.isDead) return;
    this.onReachedEnd();
    this.destroy();
  }

  isAlive(): boolean {
    return !this.isDead && this.active;
  }
}
