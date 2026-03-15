import { useState, useEffect } from 'react';

import {
  loadSettings,
  saveSettings,
  type SettingsData,
} from '../game/audio/settingsLoader';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return (
    <div className="settings">
      <h1>设置</h1>
      <div className="settings-list">
        <div className="setting-item">
          <label>背景音乐</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.bgmVolume}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                bgmVolume: parseFloat(e.target.value),
              }))
            }
          />
          <span>{Math.round(settings.bgmVolume * 100)}%</span>
        </div>
        <div className="setting-item">
          <label>音效</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.sfxVolume}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                sfxVolume: parseFloat(e.target.value),
              }))
            }
          />
          <span>{Math.round(settings.sfxVolume * 100)}%</span>
        </div>
        <p className="settings-hint">游戏为横屏模式</p>
      </div>
      <button type="button" className="btn-overlay btn-secondary" onClick={onBack}>
        返回
      </button>
    </div>
  );
}

