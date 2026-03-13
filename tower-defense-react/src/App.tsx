import { useRef, useState, useCallback, useEffect } from 'react';
import { Game } from './game/game';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameOverlay } from './components/GameOverlay';
import { StartScreen } from './components/StartScreen';
import { TutorialOverlay } from './components/TutorialOverlay';
import { TowerDetailPanel } from './components/TowerDetailPanel';
import { SettingsModal } from './components/SettingsModal';
import { loadSettings, saveSettings, loadScores } from './game/config';
import type { TowerTypeKey } from './game/tower';
import type { GameSettings } from './game/config';
import './App.css';

function App() {
  const [settings, setSettingsState] = useState(loadSettings);
  const [gameStarted, setGameStarted] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialSkipped, setTutorialSkipped] = useState(false);
  const gameRef = useRef<Game | null>(null);
  if (!gameRef.current) gameRef.current = new Game(settings);
  const game = gameRef.current;

  const [state, setState] = useState(game.getState());
  const [selectedTower, setSelectedTower] = useState<TowerTypeKey>('arrow');
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [overlay, setOverlay] = useState<{
    visible: boolean;
    title: string;
    message: string;
    stats?: { kills: number; waves: number; finalGold: number; waveBonuses: number; timeSeconds: number };
    newAchievements: string[];
    buttonText: string;
    variant: 'start' | 'victory' | 'defeat';
  } | null>(null);

  game.onStateChange = setState;

  const setSettings = useCallback((s: GameSettings) => {
    setSettingsState(s);
    saveSettings(s);
  }, []);

  const handleStartFromScreen = useCallback((s: GameSettings) => {
    setSettings(s);
    game.reset(s);
    setGameStarted(true);
    setTutorialStep(0);
    setTutorialSkipped(false);
  }, [game]);

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (game.gameOver) return;
      const existing = game.getTowerAt(x, y);
      if (existing) {
        setSelectedCell({ x, y });
        return;
      }
      if (selectedCell) setSelectedCell(null);
      game.tryPlaceTower(selectedTower, x, y);
    },
    [game, selectedTower, selectedCell]
  );

  const handleStartWave = useCallback(() => game.startWave(), [game]);
  const handlePause = useCallback(() => game.togglePause(), [game]);
  const handleSpeedToggle = useCallback(() => game.setSpeed(game.speed === 1 ? 2 : 1), [game]);
  const handleSkillFreeze = useCallback(() => game.useSkillFreeze(), [game]);
  const handleSkillNuke = useCallback(() => game.useSkillNuke(), [game]);

  const handleOverlayButton = useCallback(() => {
    setOverlay(null);
    game.reset();
    setSelectedCell(null);
  }, [game]);

  const handleUpgrade = useCallback(() => {
    if (!selectedCell) return;
    if (game.tryUpgradeTower(selectedCell.x, selectedCell.y)) setSelectedCell(null);
  }, [game, selectedCell]);

  const handleSell = useCallback(() => {
    if (!selectedCell) return;
    game.trySellTower(selectedCell.x, selectedCell.y);
    setSelectedCell(null);
  }, [game, selectedCell]);

  const handleNewGameWithSettings = useCallback((s: GameSettings) => {
    setOverlay(null);
    game.reset(s);
    setSelectedCell(null);
  }, [game]);

  useEffect(() => {
    if (state.gameOver) {
      const scores = loadScores();
      setOverlay({
        visible: true,
        title: state.gameOver === 'victory' ? '🎉 胜利！' : '💀 失败',
        message:
          state.gameOver === 'victory'
            ? `成功抵御所有波次！累计胜利: ${scores.victories}`
            : `防线被突破... 最佳波次: ${scores.bestWave}`,
        stats: {
          kills: state.totalKills,
          waves: state.wave,
          finalGold: state.gold,
          waveBonuses: state.waveBonuses,
          timeSeconds: Math.floor((Date.now() - state.startTime) / 1000),
        },
        newAchievements: game.newAchievementNames,
        buttonText: '再来一局',
        variant: state.gameOver,
      });
    }
  }, [state.gameOver]);

  const selectedTowerData = selectedCell ? game.getTowerAt(selectedCell.x, selectedCell.y) : null;
  const showTutorial = gameStarted && !tutorialSkipped && tutorialStep < 4;

  if (!gameStarted) {
    return (
      <StartScreen
        settings={settings}
        onSettingsChange={setSettings}
        onStart={() => handleStartFromScreen(settings)}
      />
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1 className="game-title">塔防小游戏</h1>
        <button className="btn-icon" onClick={() => setShowSettings(true)} title="设置">
          ⚙️
        </button>
      </header>
      <GameUI
        state={state}
        selectedTower={selectedTower}
        onSelectTower={(t) => { setSelectedTower(t); setSelectedCell(null); }}
        onStartWave={handleStartWave}
        onPause={handlePause}
        onSpeedToggle={handleSpeedToggle}
        onSkillFreeze={handleSkillFreeze}
        onSkillNuke={handleSkillNuke}
      />
      <div className="game-main">
        <div className="canvas-wrap">
          <GameCanvas
            game={game}
            selectedTower={selectedTower}
            gold={state.gold}
            selectedCell={selectedCell ?? null}
            onCanvasClick={handleCanvasClick}
          />
          {selectedTowerData && (
            <TowerDetailPanel
              tower={selectedTowerData}
              gold={state.gold}
              onUpgrade={handleUpgrade}
              onSell={handleSell}
            />
          )}
          {overlay && (
            <GameOverlay
              visible={true}
              title={overlay.title}
              message={overlay.message}
              stats={overlay.stats}
              newAchievements={overlay.newAchievements}
              buttonText={overlay.buttonText}
              variant={overlay.variant}
              onButtonClick={handleOverlayButton}
            />
          )}
          {showTutorial && (
            <TutorialOverlay
              step={tutorialStep}
              onNext={() => setTutorialStep((s) => s + 1)}
              onSkip={() => setTutorialSkipped(true)}
            />
          )}
        </div>
      </div>
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => { setSettings(s); handleNewGameWithSettings(s); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
