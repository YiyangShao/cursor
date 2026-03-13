import { useState } from 'react';
import {
  type GameSettings,
  type DifficultyKey,
  type MapId,
  type GameMode,
  MAPS,
  ACHIEVEMENTS,
  loadAchievements,
} from '../game/config';
import { loadScores } from '../game/config';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onClose: () => void;
  onReturnHome?: () => void;
}

export function SettingsModal({ settings, onSave, onClose, onReturnHome }: SettingsModalProps) {
  const [local, setLocal] = useState(settings);
  const scores = loadScores();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>设置</h2>
        <div className="modal-section">
          <label>
            <input
              type="checkbox"
              checked={local.soundEnabled}
              onChange={(e) => setLocal((s) => ({ ...s, soundEnabled: e.target.checked }))}
            />
            音效
          </label>
        </div>
        <div className="modal-section">
          <label>难度</label>
          <select
            value={local.difficulty}
            onChange={(e) => setLocal((s) => ({ ...s, difficulty: e.target.value as DifficultyKey }))}
          >
            <option value="easy">简单</option>
            <option value="normal">普通</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div className="modal-section">
          <label>模式</label>
          <select
            value={local.mode}
            onChange={(e) => setLocal((s) => ({ ...s, mode: e.target.value as GameMode }))}
          >
            <option value="campaign">关卡</option>
            <option value="endless">无尽</option>
          </select>
        </div>
        <div className="modal-section">
          <label>地图</label>
          <select
            value={local.mapId}
            onChange={(e) => setLocal((s) => ({ ...s, mapId: e.target.value as MapId }))}
          >
            {Object.entries(MAPS).map(([id, m], i) => (
              <option key={id} value={id} title={m.name}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div className="modal-section stats-preview">
          <span>胜利: {scores.victories}</span>
          <span>最好波次: {scores.bestWave}</span>
        </div>
        <div className="modal-section">
          <label>成就</label>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = loadAchievements().has(a.id);
              return (
                <div key={a.id} className={`achievement-item ${unlocked ? 'unlocked' : ''}`} title={a.desc}>
                  {a.icon} {a.name}
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => onSave(local)}>应用并新局</button>
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          {onReturnHome && (
            <>
              <button className="btn btn-secondary" onClick={onReturnHome}>回到主页</button>
              <button className="btn btn-secondary" onClick={onClose}>退出</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
