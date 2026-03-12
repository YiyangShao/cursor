import { useRef, useEffect } from 'react';
import { Game } from '../game/game';
import { render } from '../game/renderer';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

interface GameCanvasProps {
  game: Game;
  onCanvasClick?: (x: number, y: number) => void;
}

export function GameCanvas({ game, onCanvasClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;
      game.update(dt);
      render(ctx, game);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [game]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasClick) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onCanvasClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={handleClick}
      className="game-canvas"
    />
  );
}
