import { useRef, useState, useCallback, useEffect } from 'react';
import { Game } from './game/game';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameOverlay } from './components/GameOverlay';
import type { TowerTypeKey } from './game/tower';
import './App.css';

function App() {
  const gameRef = useRef<Game>(new Game());
  const game = gameRef.current;

  const [state, setState] = useState(game.getState());
  const [selectedTower, setSelectedTower] = useState<TowerTypeKey>('arrow');
  const [overlay, setOverlay] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttonText: string;
    variant: 'start' | 'victory' | 'defeat';
  }>({
    visible: true,
    title: '塔防小游戏',
    message: '放置各种塔防御敌人。箭塔快速、炮塔范围伤害、减速塔减速敌人、法师塔高伤。点击「开始波次」开始。',
    buttonText: '开始游戏',
    variant: 'start',
  });

  game.onStateChange = setState;

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (game.gameOver) return;
      game.tryPlaceTower(selectedTower, x, y);
    },
    [game, selectedTower]
  );

  const handleStartWave = useCallback(() => {
    game.startWave();
  }, [game]);

  const handleOverlayButton = useCallback(() => {
    setOverlay((prev) => ({ ...prev, visible: false }));
    game.reset();
  }, [game]);

  useEffect(() => {
    if (state.gameOver) {
      setOverlay({
        visible: true,
        title: state.gameOver === 'victory' ? '🎉 胜利！' : '💀 失败',
        message:
          state.gameOver === 'victory'
            ? '你成功抵御了所有波次的敌人！'
            : '敌人突破了你的防线...',
        buttonText: '再来一局',
        variant: state.gameOver,
      });
    }
  }, [state.gameOver]);

  return (
    <div className="game-container">
      <GameUI
        state={state}
        selectedTower={selectedTower}
        onSelectTower={setSelectedTower}
        onStartWave={handleStartWave}
      />
      <div className="canvas-wrap">
        <GameCanvas game={game} onCanvasClick={handleCanvasClick} />
        <GameOverlay
          visible={overlay.visible}
          title={overlay.title}
          message={overlay.message}
          buttonText={overlay.buttonText}
          variant={overlay.variant}
          onButtonClick={handleOverlayButton}
        />
      </div>
    </div>
  );
}

export default App;
