import { useState } from 'react';
import MainMenu from './ui/MainMenu';
import GameCanvas from './GameCanvas';
import './App.css';

type Screen = 'menu' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu onStart={() => setScreen('game')} />
      )}
      {screen === 'game' && (
        <GameCanvas />
      )}
    </div>
  );
}

export default App;
