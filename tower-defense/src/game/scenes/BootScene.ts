import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    // Phase 1: no assets yet; add loader bar later if needed
    const { width } = this.scale;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, 340, 320, 40);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x88cc44, 1);
      progressBar.fillRect(width / 2 - 150, 350, 300 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    this.load.tilemapTiledJSON('level1', '/maps/level1.json');
  }

  create() {
    this.scene.start('Game');
  }
}
