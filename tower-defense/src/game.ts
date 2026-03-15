import Phaser from 'phaser';
import { PHASER_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

export function initPhaserGame(container: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    ...PHASER_CONFIG,
    parent: container,
    scene: [BootScene, GameScene, UIScene],
  };
  return new Phaser.Game(config);
}
