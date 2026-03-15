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

    const levelId = (this.game.config as { levelId?: string }).levelId ?? 'level1';
    this.load.tilemapTiledJSON(levelId, `/maps/${levelId}.json`);
    this.load.json(`${levelId}_config`, `/config/levels/${levelId}.json`);

    // Audio: add when assets available
    // this.load.audio('sfx_place', '/assets/audio/sfx_place.ogg');
    // this.load.audio('sfx_kill', '/assets/audio/sfx_kill.ogg');
    // this.load.audio('sfx_victory', '/assets/audio/sfx_victory.ogg');
    // this.load.audio('sfx_defeat', '/assets/audio/sfx_defeat.ogg');
  }

  create() {
    const levelId = (this.game.config as { levelId?: string }).levelId ?? 'level1';
    const levelConfig = this.cache.json.get(`${levelId}_config`);
    this.scene.start('Game', { levelConfig });
  }
}
