import type { GameState } from '../game/game';
import { TOWER_TYPES, getTowerCost, type TowerTypeKey } from '../game/tower';
import { ENEMY_LABELS } from '../game/enemy';
import type { EnemyTypeKey } from '../game/enemy';
import { SKILL_COST, WAVE_BONUS } from '../game/config';

const TOWER_NAMES: Record<TowerTypeKey, string> = {
  arrow: '箭塔',
  cannon: '炮塔',
  slow: '减速塔',
  mage: '法师塔',
};

const ENEMY_ICONS: Record<EnemyTypeKey, string> = {
  goblin: '🟢',
  wolf: '🟣',
  tank: '🟤',
  boss: 'Boss',
};

interface GameUIProps {
  state: GameState;
  selectedTower: TowerTypeKey;
  onSelectTower: (t: TowerTypeKey) => void;
  onStartWave: () => void;
  onPause: () => void;
  onSpeedToggle: () => void;
  onSkillFreeze: () => void;
  onSkillNuke: () => void;
}

export function GameUI({
  state,
  selectedTower,
  onSelectTower,
  onStartWave,
  onPause,
  onSpeedToggle,
  onSkillFreeze,
  onSkillNuke,
}: GameUIProps) {
  const totalWaves = state.totalWaves;
  const canStart =
    !state.gameOver &&
    state.waveQueue === 0 &&
    state.aliveCount === 0 &&
    (totalWaves === Infinity || state.wave < totalWaves);

  const nextWave = state.nextWave ?? [];
  const waveProgress =
    state.totalInWave > 0
      ? ((state.totalInWave - state.waveQueue) / state.totalInWave) * 100
      : 0;

  return (
    <div className="ui-panel">
      <div className="stats">
        <div className="stat-item">💰 {state.gold}</div>
        <div className={`stat-item ${state.lives <= 5 ? 'lives-low' : ''}`}>
          ❤️ {state.lives}
        </div>
        <div className="stat-item">
          🌊 {state.wave}/{totalWaves === Infinity ? '∞' : totalWaves}
          {state.waveQueue > 0 && (
            <span style={{ marginLeft: 4, opacity: 0.8 }}>
              ({state.totalInWave - state.waveQueue}/{state.totalInWave})
            </span>
          )}
        </div>
      </div>

      {nextWave.length > 0 && canStart && (
        <div className="next-wave-preview" title={`完成波次可获得 +${WAVE_BONUS}💰`}>
          <span className="preview-label">下一波 (+{WAVE_BONUS}💰):</span>
          <span className="preview-icons">
            {Object.entries(
              nextWave.reduce((m: Record<string, number>, t) => {
                m[t] = (m[t] ?? 0) + 1;
                return m;
              }, {})
            ).map(([type, n]) => (
              <span
                key={type}
                title={`${ENEMY_LABELS[type as EnemyTypeKey]} x${n}`}
                className="preview-icon"
                style={{ backgroundColor: getEnemyColor(type) + '40' }}
              >
                {n > 1 ? `${ENEMY_ICONS[type as EnemyTypeKey]}×${n}` : ENEMY_ICONS[type as EnemyTypeKey]}
              </span>
            ))}
          </span>
        </div>
      )}
      <div className="wave-progress-wrap">
        <div className="wave-progress">
          <div
            className="wave-progress-fill"
            style={{ width: `${waveProgress}%` }}
          />
        </div>
      </div>

      <div className="control-buttons">
        <button
          className="btn btn-secondary"
          onClick={onPause}
          disabled={!!state.gameOver}
          title={state.paused ? '继续' : '暂停'}
        >
          {state.paused ? '▶ 继续' : '⏸ 暂停'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onSpeedToggle}
          disabled={!!state.gameOver}
          title="倍速"
        >
          {state.speed}x
        </button>
        <button
          className="btn btn-skill"
          onClick={onSkillFreeze}
          disabled={!state.skillFreezeReady}
          title={`冰冻全场 3秒 ${SKILL_COST}💰`}
        >
          ❄️ 冰冻 {state.skillFreezeCooldown > 0 ? `${Math.ceil(state.skillFreezeCooldown / 1000)}s` : ''}
        </button>
        <button
          className="btn btn-skill"
          onClick={onSkillNuke}
          disabled={!state.skillNukeReady}
          title={`全屏200伤害 ${SKILL_COST}💰`}
        >
          💥 爆破 {state.skillNukeCooldown > 0 ? `${Math.ceil(state.skillNukeCooldown / 1000)}s` : ''}
        </button>
      </div>

      <div className="tower-select">
        {(Object.keys(TOWER_TYPES) as TowerTypeKey[]).map((key) => {
          const cfg = TOWER_TYPES[key];
          const cost = getTowerCost(key, 1);
          const insufficient = state.gold < cost;
          return (
            <button
              key={key}
              className={`tower-btn ${selectedTower === key ? 'active' : ''} ${insufficient ? 'insufficient' : ''}`}
              onClick={() => onSelectTower(key)}
              title={`${cfg.icon} ${TOWER_NAMES[key]} | ${cost}💰 | 伤害${cfg.base.damage} | 射程${cfg.base.range}`}
            >
              {cfg.icon} {TOWER_NAMES[key]}
              <span className={`cost ${insufficient ? 'insufficient' : ''}`}>
                {cost}💰
              </span>
            </button>
          );
        })}
      </div>

      <button className="btn" onClick={onStartWave} disabled={!canStart}>
        开始波次
      </button>
    </div>
  );
}

function getEnemyColor(type: string): string {
  const colors: Record<string, string> = {
    goblin: '#4caf50',
    wolf: '#9c27b0',
    tank: '#795548',
    boss: '#d32f2f',
  };
  return colors[type] ?? '#888';
}
