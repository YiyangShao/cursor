import { useState } from 'react';
import MainMenu from './ui/MainMenu';
import LevelSelect from './ui/LevelSelect';
import GameCanvas from './GameCanvas';
import Settings from './ui/Settings';
import './App.css';

type Screen = 'menu' | 'levelSelect' | 'game' | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [levelId, setLevelId] = useState<string>('level1');

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          onStart={() => setScreen('levelSelect')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'settings' && (
        <Settings onBack={() => setScreen('menu')} />
      )}
      {screen === 'levelSelect' && (
        <LevelSelect
          onSelectLevel={(id) => {
            setLevelId(id);
            setScreen('game');
          }}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'game' && (
        <GameCanvas levelId={levelId} onBack={() => setScreen('levelSelect')} />
      )}
    </div>
  );
}

export default App;
