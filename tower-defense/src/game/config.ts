import Phaser from 'phaser';
import type { Types } from 'phaser';

export const GAME_CONFIG: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  backgroundColor: '#2d2d2d',
  scene: [], // Injected by GameCanvas
};
