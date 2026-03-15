import { loadSettings } from './settingsLoader';

export type SfxKey = 'place' | 'attack' | 'kill' | 'victory' | 'defeat';

export class SoundManager {
  private sfx: Map<SfxKey, Phaser.Sound.BaseSound | null> = new Map();

  constructor(_scene: Phaser.Scene) {}

  setVolume(type: 'bgm' | 'sfx', value: number): void {
    if (type === 'bgm') {
      // BGM volume applied when playing
    }
    if (type === 'sfx') {
      this.sfx.forEach((snd) => {
        if (snd && 'setVolume' in snd) {
          (snd as Phaser.Sound.WebAudioSound).setVolume(value);
        }
      });
    }
  }

  playSfx(key: SfxKey): void {
    const settings = loadSettings();
    const vol = settings.sfxVolume;
    if (vol <= 0) return;

    const snd = this.sfx.get(key);
    if (snd) {
      try {
        (snd as Phaser.Sound.WebAudioSound).setVolume?.(vol);
        (snd as Phaser.Sound.WebAudioSound).play?.();
      } catch {
        // Ignore playback errors
      }
      return;
    }

    // No loaded sound - silent no-op, avoids errors when assets missing
  }

  registerSfx(key: SfxKey, sound: Phaser.Sound.BaseSound | null): void {
    this.sfx.set(key, sound);
  }
}
