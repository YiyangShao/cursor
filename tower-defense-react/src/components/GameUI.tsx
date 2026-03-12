import type { GameState } from '../game/game';
import { TOWER_TYPES, type TowerTypeKey } from '../game/tower';

interface GameUIProps {
  state: GameState;
  selectedTower: TowerTypeKey;
  onSelectTower: (t: TowerTypeKey) => void;
  onStartWave: () => void;
}

export function GameUI({ state, selectedTower, onSelectTower, onStartWave }: GameUIProps) {
  const canStart =
    !state.gameOver &&
    state.waveQueue === 0 &&
    state.aliveCount === 0 &&
    state.wave < 5;

  return (
    <div className="ui-panel">
      <div className="stats">
        <span>💰 {state.gold}</span>
        <span>❤️ {state.lives}</span>
        <span>
          🌊 波次 {state.wave}/5
          {state.waveQueue > 0
            ? ` (${state.totalInWave - state.waveQueue}/${state.totalInWave})`
            : ''}
        </span>
      </div>
      <div className="tower-select">
        {(Object.keys(TOWER_TYPES) as TowerTypeKey[]).map((key) => {
          const cfg = TOWER_TYPES[key];
          return (
            <button
              key={key}
              className={`tower-btn ${selectedTower === key ? 'active' : ''}`}
              onClick={() => onSelectTower(key)}
              title={`${cfg.icon} - ${cfg.cost}金币`}
            >
              {cfg.icon} {key === 'arrow' ? '箭塔' : key === 'cannon' ? '炮塔' : key === 'slow' ? '减速' : '法师'}
            </button>
          );
        })}
      </div>
      <button
        className="btn"
        onClick={onStartWave}
        disabled={!canStart}
      >
        开始波次
      </button>
    </div>
  );
}
