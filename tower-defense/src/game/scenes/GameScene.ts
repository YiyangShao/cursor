import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, '保卫蛋糕', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}
