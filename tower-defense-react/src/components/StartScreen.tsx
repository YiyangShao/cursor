import { MAPS, type DifficultyKey, type GameSettings } from '../game/config';

interface StartScreenProps {
  settings: GameSettings;
  onSettingsChange: (s: GameSettings) => void;
  onStart: () => void;
}

export function StartScreen({ settings, onSettingsChange, onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="start-title">塔防小游戏</h1>
        <p className="start-subtitle">选择难度与地图，开始保卫你的阵地</p>

        <div className="start-options">
          <div className="option-group">
            <label>难度</label>
            <div className="option-buttons">
              {(['easy', 'normal', 'hard'] as DifficultyKey[]).map((k) => (
                <button
                  key={k}
                  className={`option-btn ${settings.difficulty === k ? 'active' : ''}`}
                  onClick={() => onSettingsChange({ ...settings, difficulty: k })}
                >
                  {k === 'easy' ? '简单' : k === 'normal' ? '普通' : '困难'}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>模式</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${settings.mode === 'campaign' ? 'active' : ''}`}
                onClick={() => onSettingsChange({ ...settings, mode: 'campaign' })}
              >
                关卡
              </button>
              <button
                className={`option-btn ${settings.mode === 'endless' ? 'active' : ''}`}
                onClick={() => onSettingsChange({ ...settings, mode: 'endless' })}
              >
                无尽
              </button>
            </div>
          </div>
          <div className="option-group">
            <label>地图</label>
            <div className="map-grid">
              {Object.values(MAPS).map((m, i) => (
                <button
                  key={m.id}
                  className={`map-card ${settings.mapId === m.id ? 'active' : ''}`}
                  onClick={() => onSettingsChange({ ...settings, mapId: m.id })}
                  title={m.name}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-start" onClick={onStart}>
          开始游戏
        </button>
      </div>
    </div>
  );
}
