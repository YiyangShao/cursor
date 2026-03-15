import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from './game/config';
import BootScene from './game/scenes/BootScene';
import GameScene from './game/scenes/GameScene';
import UIScene from './game/scenes/UIScene';
import GameOver from './ui/GameOver';
import Victory from './ui/Victory';
import PauseOverlay from './ui/PauseOverlay';

interface GameCanvasProps {
  levelId?: string;
  onBack?: () => void;
}

export default function GameCanvas({ levelId = 'level1', onBack }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState<{
    levelId: string;
    lives: number;
    gold: number;
  } | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig & { levelId?: string } = {
      ...GAME_CONFIG,
      parent: containerRef.current,
      scene: [BootScene, GameScene, UIScene],
      levelId,
    };


    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('GAME_OVER', () => setGameOver(true));
    game.events.on(
      'VICTORY',
      (data: { levelId: string; lives: number; gold: number }) => {
        setVictory(data ?? { levelId: 'level1', lives: 0, gold: 0 });
      },
    );
    game.events.on('PAUSE', () => setPaused(true));

    return () => {
      gameRef.current = null;
      game.destroy(true);
    };
  }, [levelId]);

  const handleRestart = () => {
    setGameOver(false);
    setVictory(null);
    setPaused(false);
    window.location.reload();
  };

  const handleResume = () => {
    gameRef.current?.scene?.resume('Game');
    gameRef.current?.scene?.resume('UI');
    setPaused(false);
  };

  return (
    <div className="game-wrapper">
      <div ref={containerRef} id="game-container" />
      {gameOver && (
        <GameOver onRestart={handleRestart} onBack={onBack} />
      )}
      {victory && (
        <Victory
          levelId={victory.levelId}
          lives={victory.lives}
          gold={victory.gold}
          onNextLevel={handleRestart}
          onBack={onBack}
        />
      )}
      {paused && (
        <PauseOverlay onResume={handleResume} onBack={onBack} />
      )}
    </div>
  );
}
