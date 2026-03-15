import { useState } from 'react';
import StartScreen from './StartScreen';
import GameView from './GameView';

export default function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />;
  }
  return <GameView />;
}
