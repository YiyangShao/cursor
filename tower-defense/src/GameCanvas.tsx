import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from './game/config';
import BootScene from './game/scenes/BootScene';
import GameScene from './game/scenes/GameScene';

interface GameCanvasProps {
  onReady?: (game: Phaser.Game) => void;
}

export default function GameCanvas({ onReady }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerRef.current,
      scene: [BootScene, GameScene],
    };

    const game = new Phaser.Game(config);

    game.events.on('ready', () => {
      onReady?.(game);
    });

    return () => {
      game.destroy(true);
    };
  }, [onReady]);

  return (
    <div className="game-wrapper">
      <div ref={containerRef} id="game-container" />
    </div>
  );
}
