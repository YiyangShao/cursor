import { useRef, useEffect, useCallback } from 'react';
import { Game } from '../game/game';
import { render, type HoverPreview } from '../game/renderer';
import { screenToCell, canPlaceTower } from '../game/path';
import { getTowerCost, type TowerTypeKey } from '../game/tower';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

interface GameCanvasProps {
  game: Game;
  selectedTower: TowerTypeKey;
  gold: number;
  selectedCell?: { x: number; y: number } | null;
  onCanvasClick?: (x: number, y: number) => void;
}

export function GameCanvas({ game, selectedTower, gold, selectedCell, onCanvasClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverPreviewRef = useRef<HoverPreview | null>(null);

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
      render(ctx, game, hoverPreviewRef.current, selectedCell ?? null);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [game, selectedCell]);

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const updateHover = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      hoverPreviewRef.current = null;
      return;
    }
    const coords = screenToCanvas(clientX, clientY);
    if (!coords) return;
    const cell = screenToCell(coords.x, coords.y);
    if (!cell) {
      hoverPreviewRef.current = null;
      return;
    }
    const canPlace = canPlaceTower(cell.col, cell.row);
    const occupied = game.towers.some(
      (t) => Math.floor(t.x / 60) === cell.col && Math.floor(t.y / 60) === cell.row
    );
    const cost = getTowerCost(selectedTower, 1);
    hoverPreviewRef.current = {
      col: cell.col,
      row: cell.row,
      towerType: selectedTower,
      canPlace: canPlace && !occupied && gold >= cost,
    };
  }, [selectedTower, gold, screenToCanvas, game]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      updateHover(e.clientX, e.clientY);
    },
    [updateHover]
  );

  const handleMouseLeave = useCallback(() => {
    hoverPreviewRef.current = null;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = screenToCanvas(e.clientX, e.clientY);
      if (!coords || !onCanvasClick) return;
      onCanvasClick(coords.x, coords.y);
    },
    [onCanvasClick, screenToCanvas]
  );

  useEffect(() => {
    if (!hoverPreviewRef.current) return;
    const cost = getTowerCost(selectedTower, 1);
    const occupied = game.towers.some(
      (t) => Math.floor(t.x / 60) === hoverPreviewRef.current!.col &&
        Math.floor(t.y / 60) === hoverPreviewRef.current!.row
    );
    hoverPreviewRef.current = {
      ...hoverPreviewRef.current,
      towerType: selectedTower,
      canPlace: gold >= cost && canPlaceTower(hoverPreviewRef.current.col, hoverPreviewRef.current.row) && !occupied,
    };
  }, [selectedTower, gold, game]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={(e) => { const t = e.touches[0]; if (t) { updateHover(t.clientX, t.clientY); e.preventDefault(); } }}
      onTouchMove={(e) => { const t = e.touches[0]; if (t) updateHover(t.clientX, t.clientY); }}
      onTouchEnd={(e) => {
        if (e.changedTouches[0]) {
          const t = e.changedTouches[0];
          const coords = screenToCanvas(t.clientX, t.clientY);
          if (coords && onCanvasClick) onCanvasClick(coords.x, coords.y);
        }
        hoverPreviewRef.current = null;
      }}
      className="game-canvas"
    />
  );
}
