import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // 占位：无贴图时用 Graphics 绘制，此处预留
  }

  create(): void {
    this.scene.start('Game');
    this.scene.launch('UI');
  }
}
