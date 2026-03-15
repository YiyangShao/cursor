export const SETTINGS_KEY = 'td_settings';

export interface SettingsData {
  bgmVolume: number;
  sfxVolume: number;
}

const defaultSettings: SettingsData = {
  bgmVolume: 0.5,
  sfxVolume: 0.7,
};

export function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<SettingsData>;
    return {
      bgmVolume: parsed.bgmVolume ?? defaultSettings.bgmVolume,
      sfxVolume: parsed.sfxVolume ?? defaultSettings.sfxVolume,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: SettingsData): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
